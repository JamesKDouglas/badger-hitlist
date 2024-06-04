import { PrismaClient } from '@prisma/client';
import { unstable_noStore as noStore } from 'next/cache';

const { expectedFollowups } = require('@/app/lib/placeholder-data.js');
const prisma = new PrismaClient();
const ITEMS_PER_PAGE = 6;

export async function fetchLatestData(){
    noStore();
    const latestRec = await prisma.record.findMany({
        orderBy: {
            updatedAt:'desc',
        },
        take: 5,
    });
    return latestRec;
}
    //status codes:
    //0 - record made, no msg scheduled/sent
    //1 - msg scheduled, not sent
    //2 - first msg sent
    //3 - second msg scheduled
    //4 - second msg sent
    //5 - third msg scheduled
    //6 - third msg sent
    //7 - final waiting period
    //8 - give up/dormant
    //9 - response recieved

    //I want to return upcoming records. - if they are in stage 0,2,4,6. after the 3rd msg the only thing left to do is check after 7 days.

    //When a user logs in their record statuses should get updated. So a function (serverside) retrieves all their records with status other than 8 or 9 and checks to see if a scheduled message has been sent then updates accordingly.

    //I'll use NextAuth.js for authentication. It issues the user a web token (cookie) when they login and accepts that token for each route.

    //when computing which records are upcoming for followup we'll need to retrieve the user id, then use that to get the settings.
    //That means retrieving the jwt from the user's computer using getToken():
    //https://next-auth.js.org/configuration/options

    //We'll do that every time the page loads. Put it in a server side function called getUserID?

export async function fetchSettings(userId){
    const profile = await prisma.profile.findUnique({
        where: {id: userId},
    });
    return profile.settingInt;
}

async function daysToFollowup(records, settings){

    //The purpose of this function is to compute the number of days to followup.
    //Records come in as an array of objects, same as the placeholder data.
    //move this to utils.js?

    //return an array that is a tally.
    //0 days, 1 days, 2 days, 3 days etc.

    let tally = new Array(7);//0 to 6;

    //This will be the time of the server. There may be a mismatch if the user is in another timezone.
    //To handle it with precision I should convert the time to the user's time using their preferences. 
    //But right now I just don't. That means that sometimes during the crossover a record might be marked as overdue a few hours early, that's all.
    let now = new Date();
    let followupStatuses = [0,2,4,6];
    let daycount = 0;
    let status = 0;

    //Look at each record. 
    //If it has been more than the max day setting since a followup, do it today.
    for (let i=0;i<records.length;i++){
        //see if it's due for followup
        status = +records[i].status;
        if (followupStatuses.includes(status)){
            //if so, how many days since last update
            daycount = now.getDate() - records[i].updatedAt.getDate();
            
            //all empty records and overdue stuff:
            if (status === 0){
                //if a company record is made but no record is sent... get to that one today.
                tally[0]++;
                continue;
            } else if (status === 2 && daycount>settings[0]){
                tally[0]++;
                continue;
            } else if (status === 4 && daycount>settings[1]){
                tally[0]++;
                continue;
            } else if (status === 6 && daycount>settings[2]){
                tally[0]++;
                continue;
            }
 
            //All other records needing followup:
            //If followup is next week then don't return that as part of the tally. One of the cards can read total followups queued?
            if (status === 2){
                if ((settings[0]-daycount)>6){
                    continue;
                }
                tally[settings[0]-daycount];
            } else if (status === 4){
                if ((settings[1]-daycount)>6){
                    continue;
                }
                tally[settings[1]-daycount];
            } else if (status === 6){
                if ((settings[2]-daycount)>6){
                    continue;
                }
                tally[settings[2]-daycount];
            }
        }
    }
    
    return tally;
}

export async function fetchCardData(){
// returns :
// msgsThisWeek (integer),
// quote (string),
// msgsSentTotal (int),
    let test = {msgsThisWeek: "10", quote:'hello',msgsSentTotal:"10",};
    return test;
}

export async function fetchUpcomingWork(){
    //This function returns the number of upcoming required followups.
    //Of course that changes depending on settings and new entries which may be made tomorrow, but it's a projection based on current entries.

    //First, get a bunch of records. Going back about days I guess for the updated date. No because then entries would "fall off the map". That does bring up the need for expiration settings. That is, suppose someone doesn't follow up - maybe life happens and they don't use the app at all for 2 weeks. Shouldn't they be able to resume?
    //Well, just have a "past due" category.

    //So this function is really only to show the user what would be upcoming under 'normal' conditions - based on the settings and current records.

    noStore();

    //get all the reservations made in the past 8 days
    let days = 8;
    let now = new Date();
    let past = new Date();
    past.setDate(past.getDate() - days);

    const upcomingRec = await prisma.record.findMany({
        where: {
            createdAt:{
                lte: now.toISOString(),
                gte: past.toISOString(),
            }
        }
    });
    return upcomingRec;
}


