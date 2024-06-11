const { PrismaClient } = require('@prisma/client');
const { buildClient } = require('@datocms/cma-client-node');
const fs = require('fs');
const { promisify } = require('util');
const os = require('os');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Initialize Prisma and DatoCMS clients
const prisma = new PrismaClient();
const datoClient = buildClient({ apiToken: process.env.DATOCMS_API_KEY });
const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);

/**
 * Fetch the video thumbnail from YouTube.
 * @param {string} videoId - The ID of the YouTube video.
 * @returns {Buffer} - The thumbnail image buffer.
 */
async function fetchVideoThumbnail(videoId) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
        const thumbnailUrl = data.items[0].snippet.thumbnails.maxres.url;
        const thumbnailResponse = await fetch(thumbnailUrl);
        const thumbnailBuffer = await thumbnailResponse.buffer();
        return thumbnailBuffer;
    }
    throw new Error('Failed to fetch video thumbnail from YouTube.');
}

/**
 * Upload an image to DatoCMS.
 * @param {Buffer} imageBuffer - The image buffer.
 * @param {string} imageName - The name of the image.
 * @returns {object} - The uploaded image object from DatoCMS.
 */
async function uploadImageToDato(imageBuffer, imageName) {
    const uniqueName = `${uuidv4()}-${imageName}`;
    const tempFilePath = path.join(os.tmpdir(), uniqueName);

    try {
        await writeFile(tempFilePath, imageBuffer);
        const upload = await datoClient.uploads.createFromLocalFile({
            localPath: tempFilePath,
        });
        await unlink(tempFilePath);
        return upload;
    } catch (error) {
        console.error('Failed to upload image to DatoCMS:', error);
        throw error;
    }
}

/**
 * Check for duplicate entries in DatoCMS.
 * @param {string} video_id - The video ID.
 * @param {string} chapter_title - The chapter title.
 * @returns {boolean} - True if a duplicate is found, false otherwise.
 */
async function checkForDuplicate(video_id, chapter_title) {
    const existingRecord = await datoClient.items.list({
        filter: {
            type: "article",
            fields: {
                video_id: { eq: video_id },
                chapter_title: { eq: chapter_title }    
            }
        },
    });
    console.log(video_id);
    console.log(chapter_title);
    console.log(existingRecord.length);
    return existingRecord.length > 0;
}

/**
 * Create a DatoCMS record.
 * @param {object} newsletter - The newsletter object.
 * @param {array} imageUploads - The array of image uploads.
 * @param {object} thumbnailUpload - The thumbnail upload.
 * @returns {object|null} - The created DatoCMS record or null if duplicate.
 */
async function createDatoRecord(newsletter, imageUploads, thumbnailUpload) {
    const itemTypeId = { type: "item_type", id: "diFpfEcBT5a04Io1qbg4og" };
    const recordData = {
        item_type: itemTypeId,
        date_uploaded: newsletter.release_date,
        release_date: newsletter.release_date,
        start_time: newsletter.start_time,
        uploader_id: newsletter.uploader_id,
        uploader_name: newsletter.uploader,
        channel_id: newsletter.channel_id,
        video_id: newsletter.video_id,
        video_title: newsletter.video_title,
        chapter_title: newsletter.chapter,
        text_body: newsletter.text_data,
    };

    if (imageUploads.length > 0) {
        recordData.graphs = imageUploads.map(upload => ({
            upload_id: upload.id,
        }));
    }

    if (thumbnailUpload) {
        recordData.thumbnail = { upload_id: thumbnailUpload.id };
    }

    const duplicate = await checkForDuplicate(newsletter.video_id, newsletter.chapter);
    if (duplicate) {
        console.log("Duplicate found, skipping creation.");
        await prisma.newsletters.update({
            where: {
                video_id: newsletter.video_id,
                chapter: newsletter.chapter,
            },
            data: {
                in_dato: true
            }
        });
        console.log("Updated in_dato to true for existing record.");
        return null;
    }

    const createdRecord = await datoClient.items.create(recordData);
    await prisma.newsletters.update({
        where: {
            video_id: newsletter.video_id,
            chapter: newsletter.chapter,
            in_dato: false
        },
        data: {
            in_dato: true
        }
    });
    return createdRecord;
}

/**
 * Process newsletters and upload data to DatoCMS.
 */
async function processNewsletters() {
    const newsletters = await prisma.newsletters.findMany({
        where: { in_dato: false }
    });

    const thumbnailUploads = new Map(); // To store the thumbnail uploads by video ID

    for (const newsletter of newsletters) {
        console.log('Processing newsletter:', newsletter.video_id, newsletter.chapter);
        let imageUploads = [];
        let thumbnailUpload = thumbnailUploads.get(newsletter.video_id);

        // Check for duplicate before processing
        const isDuplicate = await checkForDuplicate(newsletter.video_id, newsletter.chapter);
        if (isDuplicate) {
            console.log("Duplicate found, skipping creation.");
            await prisma.newsletters.update({
                where: {
                    video_id: newsletter.video_id,
                    chapter: newsletter.chapter,
                },
                data: {
                    in_dato: true
                }
            });
            console.log("Updated in_dato to true for existing record.");
            continue; // Skip the rest of the loop for this newsletter
        }

        if (newsletter.images && newsletter.images.length > 0) {
            imageUploads = await Promise.all(
                newsletter.images.map(img => uploadImageToDato(img, `newsletter-image.png`))
            );
        }

        if (!thumbnailUpload) {
            try {
                const thumbnailBuffer = await fetchVideoThumbnail(newsletter.video_id);
                thumbnailUpload = await uploadImageToDato(thumbnailBuffer, `thumbnail.png`);
                thumbnailUploads.set(newsletter.video_id, thumbnailUpload);
            } catch (error) {
                console.error('Failed to upload video thumbnail to DatoCMS:', error);
            }
        }

        try {
            const datoRecord = await createDatoRecord(newsletter, imageUploads, thumbnailUpload);
            if (datoRecord) {
                console.log('Successfully created DatoCMS record:', datoRecord);
            }
        } catch (error) {
            console.error('Failed to create DatoCMS record:', error);
        }
        await prisma.$disconnect();
        console.log("Database disconnected.");
    }

    // Cleanup and disconnect from the database
    // processNewsletters()
    //     .catch(e => {
    //         console.error('Error processing newsletter: ', e);
    //     })
    //     .finally(async () => {
    //         console.log("Process Finished.");
    //     });
}

processNewsletters();
