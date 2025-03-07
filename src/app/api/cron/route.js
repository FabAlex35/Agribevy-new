import { querys } from "../../lib/DbConnection";

export const dynamic = "force-dynamic";

async function checkAndUpdateSubscriptions() {
    const currentDate = new Date();

    // Query users whose subscriptions are active but have expired
    const expiredSubscriptions = await querys({
        query: 'SELECT * FROM subscription_list WHERE sub_status = 1 AND expiry_date < ?',
        values: [currentDate]
    });

    // For each expired subscription, update the status to 'expired'
    for (const subscription of expiredSubscriptions) {
        await querys({
            query: 'UPDATE subscription_list SET sub_status = 0 WHERE id = ?',
            values: [subscription.id]
        });

        console.log(`Subscription ID: ${subscription.id} has expired and was updated.`);
    }

}

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            console.log('Checking and updating subscriptions...');
            await checkAndUpdateSubscriptions();
            return res.status(200).json({ message: 'Subscription check completed.' });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    } else {
        res.status(405).json({ error: 'Method Not Allowed' });
    }
}
