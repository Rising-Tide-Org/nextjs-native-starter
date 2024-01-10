import { User } from 'types/User'

const suggestionsPrompt = (user: User) => `
Based on this conversation, and considering my expressed preferences, what are between five and seven New Year's Resolutions I should consider committing to?

Format each resolution with a title, description, and completion interval and count (see example below). Each title should start with an emoji and verb and include the most actionable details (e.g. time of day, people, number of times per week). Keep resolutions concise, with descriptions limited to 15 words. The possible values for the 'interval' property are 'once', 'weekly', or 'forever'. Set the interval to 'once' if it's a one-time action, 'weekly' if it is an action that should be completed a certain number of times per week, or 'forever' if it's an ongoing broad goal, value, or mantra. The 'completionsRequired' property must be included when the interval is 'weekly'; it represents the number of times the habit should be completed each week and must be an integer between 1 and 7. Do not suggest journaling, therapy, support groups, or mindfulness techniques. 

Always respond in JSON. Here is an example:
[
  {
    title: "⛰️ Enhance my leadership skills",
    description: "Take initiative in team projects, volunteer for leadership roles, and seek feedback on my leadership style to further develop as a leader.",
    metadata: {
      interval: "forever",
    }
  },
  {
    title: "🥘 Cook something new 3x per week",
    description: "Prepare a new dish each week to expand my cooking skills and explore my creativity",
    metadata: {
      interval: "weekly"
      completionsRequired: 3
    }
  },
  {
    title: "🎡 Connect with a friend 1x per week",
    description: "Reach out to a different friend each week for a catch-up, deepening relationships and maintaining a strong social support network.",
    metadata: {
      interval: "weekly",
      completionsRequired: 1
    }
  }
]

User language: ${user?.settings?.locale ?? 'en'}
`

export default suggestionsPrompt
