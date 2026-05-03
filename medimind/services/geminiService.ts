
import { GoogleGenAI, Type } from '@google/genai';
import { Medication, HealthCondition, Recommendation } from '../types';

// Singleton instance: Initialized once to be used throughout the app life-cycle.
// It relies on process.env.API_KEY which is injected by the platform.
const apiKey = typeof (import.meta as any).env !== 'undefined'
    ? ((import.meta as any).env.VITE_GEMINI_API_KEY || (import.meta as any).env.VITE_API_KEY || '')
    : (process.env.GEMINI_API_KEY || process.env.API_KEY || '');

const ai = new GoogleGenAI({ apiKey });
/**
 * Helper to clean AI response strings that might contain markdown code blocks
 */
function cleanJsonResponse(text: string): string {
    return text.replace(/```json\n?|```/g, '').trim();
}

/**
 * Identifies medication from an image.
 * Extracts: Name, Dosage, Manufactured Date (MFG), and Expiry Date (EXP).
 */
export async function identifyMedicationFromImage(base64Image: string): Promise<{name?: string; dosage?: string; manufacturedDate?: string; expiryDate?: string; error?: string}> {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Image,
                    },
                },
                {
                    text: "Analyze this medication label. Extract the brand name, dosage strength (e.g., 500mg), the manufacturing date (MFG), and the expiration date (EXP). Standardize all dates to YYYY-MM-DD. Return valid JSON.",
                },
            ],
        },
        config: {
            systemInstruction: "You are a medical OCR specialist. Extract identity, MFG, and EXP dates only. Ignore secondary text. Return JSON only.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Brand name" },
                    dosage: { type: Type.STRING, description: "Strength" },
                    manufacturedDate: { type: Type.STRING, description: "YYYY-MM-DD" },
                    expiryDate: { type: Type.STRING, description: "YYYY-MM-DD" },
                    isIdentifiable: { type: Type.BOOLEAN },
                    errorMessage: { type: Type.STRING }
                },
                required: ["isIdentifiable"]
            }
        }
    });
    
    const result = JSON.parse(cleanJsonResponse(response.text || '{}'));
    
    if (result.isIdentifiable) {
        return { 
            name: result.name, 
            dosage: result.dosage,
            manufacturedDate: result.manufacturedDate,
            expiryDate: result.expiryDate 
        };
    }
    return { error: result.errorMessage || 'Could not read the label clearly.' };
  } catch (error: any) {
    console.error('AI Error:', error);
    return { error: "Connection error. Please check your network." };
  }
}

/**
 * Scans a medical prescription to extract multiple medications.
 */
export async function scanPrescriptionFromImage(base64Image: string): Promise<{medications?: Array<{name: string; dosage: string; slots: string[]}>; error?: string}> {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/jpeg',
                        data: base64Image,
                    },
                },
                {
                    text: "Analyze this prescription. Extract ALL medicines listed. For each, find the name, the dosage (e.g., 500mg), and the schedule or frequency. Map the frequency to one or more of these slots: 'Morning', 'Afternoon', 'Night'. Return valid JSON with an array of medications.",
                },
            ],
        },
        config: {
            systemInstruction: "You are a prescription parsing assistant. Extract ALL medicine names, dosages, and frequencies. Map frequency to 'Morning', 'Afternoon', or 'Night'. Return a JSON object with a 'medications' array and 'isReadable' boolean.",
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    medications: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                name: { type: Type.STRING },
                                dosage: { type: Type.STRING },
                                slots: { 
                                    type: Type.ARRAY, 
                                    items: { type: Type.STRING, enum: ['Morning', 'Afternoon', 'Night'] } 
                                }
                            },
                            required: ["name", "dosage", "slots"]
                        }
                    },
                    isReadable: { type: Type.BOOLEAN },
                    errorMessage: { type: Type.STRING }
                },
                required: ["isReadable"]
            }
        }
    });
    
    const result = JSON.parse(cleanJsonResponse(response.text || '{}'));
    
    if (result.isReadable) {
        return { 
            medications: result.medications
        };
    }
    return { error: result.errorMessage || 'Could not read the prescription clearly.' };
  } catch (error: any) {
    console.error('AI Error:', error);
    return { error: "Connection error. Please check your network." };
  }
}

/**
 * Generates personalized health recommendations.
 */
export async function getPersonalizedRecommendations(medications: Medication[], healthConditions: HealthCondition[]): Promise<Recommendation[]> {
    const medList = medications.map(m => `${m.name} (${m.dosage})`).join(', ') || 'None';
    const conditionList = healthConditions.map(c => c.name).join(', ') || 'None';

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: `Patient takes: ${medList}. Conditions: ${conditionList}. Give 2 diet and 2 exercise tips for an elderly person.`,
            config: {
                systemInstruction: "Medical Advisor. Senior-safe advice only. JSON array response.",
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            type: { type: Type.STRING, enum: ['diet', 'exercise'] },
                            title: { type: Type.STRING },
                            description: { type: Type.STRING },
                            explanation: { type: Type.STRING }
                        },
                        required: ["type", "title", "description", "explanation"]
                    }
                }
            }
        });
        
        return JSON.parse(cleanJsonResponse(response.text || '[]')) as Recommendation[];
    } catch (error) {
        console.error('Recommendation Error:', error);
        throw new Error('Failed to fetch tips.');
    }
}
