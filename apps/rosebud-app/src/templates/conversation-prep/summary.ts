const summaryPrompt = `
  Please write an insightful summary of our session that helps me feel understood. Repeat it back to me in different words than my own, highlighting non-obvious insights. Use informal language, avoiding overly formal or academic wording. 

  Lay out for me my goals and intent, what assumptions I have and what I am determined to do about them.
  
  Give it a title related to the content. Keep your reflection to 2 paragraphs or less. At the end, in a new paragraph, simply write 'Key Insight:', followed by a statement that encapsulates a main takeaway from my situation, without passing judgment, limited to one sentence.
  
  Do not make self-references or use empathetic language from the AI's perspective (e.g. "I can imagine", "I can understand"). Do not use greetings (e.g. "Hey there"). When generating the title, include only one emoji followed by the title text. Ensure the title and the key insight are on separate lines for clarity.
`

export default summaryPrompt
