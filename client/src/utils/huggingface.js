const HF_API_KEY = process.env.REACT_APP_HUGGINGFACE_API_KEY;

export const generateLeadSummary = async (leadData) => {
  const response = await fetch('https://api-inference.huggingface.co/models/facebook/bart-large-cnn', {
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      inputs: `Company: ${leadData.companyName}, Contact: ${leadData.contactName}, Status: ${leadData.status}, Notes: ${leadData.notes || 'No notes'}`
    })
  });
  
  return await response.json();
};

export const analyzeLeadSentiment = async (notes) => {
  const response = await fetch('https://api-inference.huggingface.co/models/cardiffnlp/twitter-roberta-base-sentiment-latest', {
    headers: {
      'Authorization': `Bearer ${HF_API_KEY}`,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({ inputs: notes })
  });
  
  return await response.json();
};