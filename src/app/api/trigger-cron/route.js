import { NextResponse } from 'next/server';
import cron from 'node-cron';
import { querys } from '../../lib/DbConnection';

// Use a global variable to persist the cron job instance across requests
if (!global.cronJob) {
  global.cronJob = null;
}

// Function to start the cron job
const startCronJob = () => {
  if (!global.cronJob) {
    // global.cronJob = cron.schedule('* * * * *', () => {
    //   console.log('Cron job running every minute');
    // });

    global.cronJob =  cron.schedule('0 0 * * *', async () => {
            const getAll = await querys({
                query: 'SELECT * FROM subscription_list',
                values: []
            })
            console.log('Cron job started1');
            if(getAll.length != 0){
                getAll.map(async(each,ind)=>{
                    let days = each.days-1
                    const today = new Date();
                    const currentDate = today.toISOString().split('T')[0];
                            console.log(each.end_date,currentDate);
                                                   
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
    console.log('Cron job started');
  } else {
    console.log('Cron job already running');
  }
};

// Function to stop the cron job
const stopCronJob = () => {
  if (global.cronJob) {
    console.log('Stopping cron job...');
    global.cronJob.stop(); // Stop the cron job
    global.cronJob = null; // Remove reference to it
    console.log('Cron job stopped');
  } else {
    console.log('No cron job running');
  }
};

// Export a named handler for GET
export async function GET(req) {
  const { searchParams } = req.nextUrl;
  const action = searchParams.get('action'); // Get 'action' query parameter

  if (action === 'start') {
    startCronJob();
    return NextResponse.json({ message: 'Cron job started' }, { status: 200 });
  } else if (action === 'stop') {
    stopCronJob();
    return NextResponse.json({ message: 'Cron job stopped' }, { status: 200 });
  } else {
    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  }
}
