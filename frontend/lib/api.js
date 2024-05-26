import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function fetchData(userId) {
    const allArticles = [];
    const snapshots = await prisma.weekly_user_configuration_snapshot.findMany({
        where: { user_id: userId },
        orderBy: { start_at: 'desc' }
    });

    if (!snapshots || snapshots.length === 0) {
        throw new Error('No user configuration found for the given user ID');
    }

    const limit = 100; // Adjust based on your data size

    for (let i = 0; i < snapshots.length; i++) {
        const { creator_name: creatorNames, key_words: keyWords, start_at: snapshotTime } = snapshots[i];
        let nextSnapshotTime = snapshots[i + 1] ? snapshots[i + 1].start_at : new Date();
        // Check if snapshotTime is equal to nextSnapshotTime
        if (snapshotTime.toISOString() === nextSnapshotTime.toISOString()) {
            nextSnapshotTime = new Date();
            console.log('Snapshot time equals Next snapshot time, updated Next snapshot time to:', nextSnapshotTime);
        }
        console.log('Snapshot time:', snapshotTime, 'Next snapshot time:', nextSnapshotTime)

        const creatorsWithAt = creatorNames.map(name => `@${name}`);
        let hasMore = true;
        let skip = 0;

        while (hasMore) {
            const response = await fetch('https://graphql.datocms.com/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DATOCMS_API_KEY}`,
                },
                body: JSON.stringify({
                    query: `
                    {
                        allArticles(first: ${limit}, skip: ${skip}, orderBy: releaseDate_DESC, filter: { 
                            releaseDate: { gte: "${snapshotTime.toISOString()}", lt: "${nextSnapshotTime.toISOString()}" },
                            uploaderId: { in: ${JSON.stringify(creatorsWithAt)} },
                            OR: [
                                ${keyWords.map(word => `{ videoTitle: { matches: { pattern: "${word}", caseSensitive: false } } }`).join(',')}
                            ]
                        }) {
                            id
                            releaseDate
                            uploaderId
                            thumbnail {
                                id
                                url
                            }
                            uploaderName
                            channelId
                            videoId
                            videoTitle
                            _firstPublishedAt
                        }
                    }
                    `
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            const data = await response.json();
            const articles = data.data.allArticles;

            if (articles.length > 0) {
                allArticles.push(...articles);
                skip += limit;
            } else {
                hasMore = false;
            }
        }
    }

    // Aggregate articles by videoId, ensuring uniqueness
    const uniqueArticles = {};
    allArticles.forEach(article => {
        if (!uniqueArticles[article.videoId]) {
            uniqueArticles[article.videoId] = {
                id: article.id,
                uploaderId: article.uploaderId,
                thumbnail: article.thumbnail.url,
                uploaderName: article.uploaderName,
                channelId: article.channelId,
                videoId: article.videoId,
                videoTitle: article.videoTitle,
                releaseDate: article.releaseDate,
                _firstPublishedAt: article._firstPublishedAt,};
        }
    });

    return Object.values(uniqueArticles); // Return an array of unique articles
}

export function groupNewslettersByWeek(newsletters) {
    return newsletters.reduce((acc, newsletter) => {
        const releaseDate = new Date(newsletter.releaseDate);
        const nextSunday = new Date(releaseDate);

        // Adjust to the next Sunday
        const dayOfWeek = releaseDate.getDay();
        const daysUntilSunday = (7 - dayOfWeek) % 7;
        nextSunday.setDate(releaseDate.getDate() + daysUntilSunday);
        nextSunday.setHours(0, 0, 0, 0); // Set to the beginning of Sunday
        nextSunday.setMinutes(nextSunday.getMinutes() - nextSunday.getTimezoneOffset()); // Adjust for timezone offset

        // Format next Sunday date as a string for use as the key
        const weekKey = nextSunday.toISOString().split('T')[0];

        if (!acc[weekKey]) {
            acc[weekKey] = [];
        }
        acc[weekKey].push(newsletter);
        return acc;
    }, {});
}


export async function fetchDataById(id, userId) {
    console.log('Fetching data by id:', id);
    
    const userConfig = await prisma.weekly_user_configuration_snapshot.findFirst({
        where: {
            user_id: userId,
        },
        select: {
            multi_media: true,
        },
    });

    if (!userConfig) {
        throw new Error('No user configuration found for the given user ID');
    }

    const { multi_media } = userConfig;

    let query;

    if (multi_media) {
        query = `
        {
            allArticles(orderBy: startTime_ASC, filter: {videoId: {eq: "${id}"}}) {
                id
                dateUploaded
                releaseDate
                startTime
                uploaderId
                thumbnail {
                    id
                    url
                }
                uploaderName
                channelId
                videoId
                videoTitle
                chapterTitle
                graphs {
                    id
                    url
                }
                chapterTitle
                textBody
                _firstPublishedAt
            }
        }
        `;
    } else {
        query = `
        {
            allArticles(orderBy: startTime_ASC, filter: {videoId: {eq: "${id}"}}) {
                id
                dateUploaded
                releaseDate
                startTime
                uploaderId
                thumbnail {
                    id
                    url
                }
                uploaderName
                channelId
                videoId
                videoTitle
                chapterTitle
                chapterTitle
                textBody
                _firstPublishedAt
            }
        }
        `;
    }

    try {
        const response = await fetch('https://graphql.datocms.com/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DATOCMS_API_KEY}`,
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok: ' + response.statusText);
        }

        const data = await response.json();
        const articles = data.data.allArticles;

        if (articles.length === 0) {
            throw new Error('No article found with the given ID');
        }
        return articles;
    } catch (error) {
        console.error('Error fetching article by ID:', error);
        throw error;
    }
}

export async function fetchDataNewsletter(userId, creatorName, keyWords, snapshotTime, multiMedia) {
    const creatorsWithAt = creatorName.map(name => `@${name}`);
    const graphQuery = `
    {
        allArticles(first: 100, orderBy: [videoId_DESC, releaseDate_DESC, startTime_ASC], filter: { 
            releaseDate: { gte: "${snapshotTime.toISOString()}" },
            uploaderId: { in: ${JSON.stringify(creatorsWithAt)} },
            OR: [
                ${keyWords.map(word => `{ videoTitle: { matches: { pattern: "${word}", caseSensitive: false } } }`).join(',')}
            ]
        }) {
            id
            dateUploaded
            releaseDate
            startTime
            uploaderId
            uploaderName
            channelId
            videoId
            videoTitle
            chapterTitle
            textBody
            _firstPublishedAt
        }
    }
    `;

    const response = await fetch('https://graphql.datocms.com/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_DATOCMS_API_KEY}`,
        },
        body: JSON.stringify({
            query: graphQuery
        }),
    });

    if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
    }

    const data = await response.json();
    if (!data || !data.data || !data.data.allArticles) {
        throw new Error('Invalid response structure: ' + JSON.stringify(data));
    }

    const allArticles = data.data.allArticles;

    // Aggregate articles by videoId, ensuring uniqueness
    const structuredNewsletters = {};
    allArticles.forEach(newsletter => {
        if (!structuredNewsletters[newsletter.videoId]) {
            structuredNewsletters[newsletter.videoId] = [];
        }
        structuredNewsletters[newsletter.videoId].push({
            id: newsletter.id, 
            dateUploaded: newsletter.dateUploaded,
            releaseDate: newsletter.releaseDate,
            startTime: newsletter.startTime,
            uploaderId: newsletter.uploaderId,
            thumbnail: newsletter.thumbnail.url,
            uploaderName: newsletter.uploaderName,
            channelId: newsletter.channelId,
            videoId: newsletter.videoId,
            videoTitle: newsletter.videoTitle,
            chapterTitle: newsletter.chapterTitle, 
            textBody: removeTopicHeader(newsletter.textBody),
            graphs: newsletter.graphs ? newsletter.graphs.map(g => ({ "url": g.url })) : [],
            _firstPublishedAt: newsletter._firstPublishedAt
        });
    });


    return structuredNewsletters; // Return an array of unique articles
}

function removeTopicHeader(textBody) {
    // Split the textBody by newline character
    const textArray = textBody.split('\n');

    // Slice the array to exclude the first element
    const textWithoutHeader = textArray.slice(1);

    return textWithoutHeader;
}