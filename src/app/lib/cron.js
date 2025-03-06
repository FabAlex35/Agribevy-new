import cron from 'node-cron';
import { querys } from './DbConnection';

// Cron job that runs every minute
export function startCronJob() {
    cron.schedule('0 0 * * *', async () => {
        const getAll = await querys({
            query: 'SELECT * FROM subscription_list',
            values: []
        })

        if(getAll.length != 0){
            getAll.map(async(each,ind)=>{
                let days = each.days-1
                const today = new Date();
                const currentDate = today.toISOString().split('T')[0];
                                               
                if(each.end_date <  currentDate){
                    days = -1;
                    const update = await querys({
                        query: "UPDATE subscription_list SET sub_id = ?, sub_status = ?, days = ?, is_show = ? WHERE user_id = ?",
                        values: [!each.status, 0, days, 1, each.user_id]
                    })
                    
                }else{
                    const update = await querys({
                        query: "UPDATE subscription_list SET sub_status = ?, days = ? WHERE user_id = ?",
                        values: [1, days, each.user_id]
                    })
                }
               
            })  
        }else{
            return
        }
    });
}
