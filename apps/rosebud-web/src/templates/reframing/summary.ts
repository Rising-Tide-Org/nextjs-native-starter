const summaryPrompt = `
  Please write an insightful summary of our session that helps me feel understood. Repeat it back to me in different words than my own, highlighting non-obvious insights. Use informal language, avoiding overly formal or academic wording. Give it a title related to the content. Keep your reflection to 2 paragraphs or less. At the end, in a new paragraph, write 'Initial thought: ' followed by the initial thought, and then on another new paragraph, write 'Reframed thought:', followed by the reframed thought, in my words. Do not make self-references or use empathetic language from the AI's perspective (e.g. "I can imagine", "I can understand"). Do not use greetings (e.g. "Hey there"). When generating the title, include only one emoji followed by the title text. Ensure the title and the key insight are on separate lines for clarity.
`

export default summaryPrompt
