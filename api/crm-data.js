// 🏠 DOMUS-IA - CRM DATA API
// Endpoint GET para obtener datos del CRM

import supabaseClient from './supabase-client.js';

export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { type, userEmail } = req.query;
        
        if (!userEmail) {
            return res.status(400).json({ error: 'userEmail required' });
        }
        
        const user = await supabaseClient.getOrCreateUser(userEmail);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        if (type === 'properties') {
            const properties = await supabaseClient.getUserProperties(user.id);
            return res.status(200).json({ success: true, properties });
        }
        
        if (type === 'contacts') {
            return res.status(200).json({ success: true, contacts: [] });
        }
        
        if (type === 'tasks') {
            const tasks = await supabaseClient.getPendingTasks(user.id);
            return res.status(200).json({ success: true, tasks });
        }
        
        return res.status(400).json({ error: 'Invalid type' });
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
}
