// lib/utils.js
import React from 'react';

export function parseText(text) {
    const elements = [];

    const parts = text.split(/(\*\*.*?\*\*)/g); // Split by bold (**) and quotes ("")
    
    for (const part of parts) {
        if (part.startsWith('**') && part.endsWith('**')) {
            elements.push(<strong key={part}>{part.slice(2, -2)}</strong>);
        } else {
            elements.push(part);
        }
    }

    return elements;
}

export function calculateProgressToNextSunday() {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const nextSunday = new Date(now);
    nextSunday.setDate(now.getDate() + daysUntilSunday);
    nextSunday.setHours(0, 0, 0, 0); // Set to the beginning of Sunday

    const previousSunday = new Date(nextSunday);
    previousSunday.setDate(previousSunday.getDate() - 7);

    const totalMillisecondsInWeek = 7 * 24 * 60 * 60 * 1000;
    const timePassedSinceLastSunday = now.getTime() - previousSunday.getTime();

    const progress = (timePassedSinceLastSunday / totalMillisecondsInWeek) * 100;
    return Math.min(progress, 100); // Cap the progress at 100%
}


// lib/utils.js
export function groupNewslettersByWeek(newsletters) {
    return newsletters.reduce((acc, newsletter) => {
        const releaseDate = new Date(newsletter.releaseDate);
        const nextSunday = new Date(releaseDate);

        // Adjust to the next Sunday
        const dayOfWeek = releaseDate.getDay();
        const daysUntilSunday = (7 - dayOfWeek) % 7;
        nextSunday.setDate(releaseDate.getDate() + daysUntilSunday);

        // Format next Sunday date as a string for use as the key
        const weekKey = nextSunday.toISOString().split('T')[0];

        if (!acc[weekKey]) {
            acc[weekKey] = [];
        }
        acc[weekKey].push(newsletter);
        return acc;
    }, {});
}
