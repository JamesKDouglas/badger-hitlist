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

// export async function fetchReservationsPages(query: string){
//     noStore();
//     try{
//         let count = 0; 
//         if (/^\d+$/.test(query)){
//             //This just searches for the exact value of course. I'm starting to get into like if someone types in 1, should that search for of value 100 or 201? Idk it's an edge case.
//             let queryNum = +query;
//             count = await prisma.reservation.count({
//                 where: {
//                     amount: { equals: queryNum },
//                   }
//             });
//         } else {
//             count = await prisma.reservation.count({
//                 where: {
//                     OR: [
//                         {childNames: { contains: query, mode: 'insensitive' }},
//                         {customerName: { contains: query, mode: 'insensitive' }},
//                         {email: { contains: query, mode: 'insensitive' }},
//                         {notes: { contains: query, mode: 'insensitive' }},
//                     ]
//                 }
//             });
//         }
//         console.log("count of records found:", count);
//         // let totalPages = 0;//I'm getting a typeerror stating that this is undefined? Well, I'll define it here then to make a default.
//         const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
//         console.log(typeof(totalPages));
//         return totalPages;
//     } catch(e){
//         console.log(e);
//     }

// }


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
    const profile = await prisma.profile.findUnique{
        where: {id: userId},
    }
    return profile.settingInt;
}

async function daysToFollowup(records, settings){

    //The purpose of this function is to compute the number of days to followup.
    //Records come in as an array of objects, same as the placeholder data.

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

    //now summarize how many people are coming in each day OR each week.
    //what does the object look like when returned by prisma? What kind of methods does it have?

    // right now there is a "one child one reservation" policy. Parents can still use autofill on the form of course. But they can't literally just set # of children to 2 or more on a single form - there is only one place for the child name.

    // I should put in an easter egg for "Johnny" "DROP TABLE". Just console log a "lol, good one." Confetti?

    // console.log(upcomingRes)

    //fudge it for now,
    return expectedAttendance;
    // let summaryAtt = [];
    // if (period == "days"){
    //     //
    //     for (let i=0;i<6;i++){

    //         summaryAtt.push()
    //     }
    // } else if (period == "weeks"){

    // }

}

export async function fetchSchedules(){
    // noStore();//I don't really want the whole schedule table being looked up with each reservation search.
    const allSchedules = await prisma.schedule.findMany();
    // console.log(allSchedules);
    return allSchedules;
}

export async function fetchScheduleById(id:string){
    let idNum = Number(id);
    const schedule = await prisma.schedule.findUnique({
        where: {id:idNum},
    })
    return schedule;
}

export async function fetchFilteredSchedules(
    query: string, 
    currentPage:number,){

    noStore();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try{
        let data: Schedules; 
        
        data = await prisma.schedule.findMany({
            skip: offset,
            take: ITEMS_PER_PAGE,
            orderBy: [
                {
                    id: 'desc',
                }
            ],
            where: {
                OR: [
                    {desc: { contains: query, mode: 'insensitive' }},
                    {name: { contains: query, mode: 'insensitive' }},
                    // {startList: { contains: query, mode: 'insensitive' }},
                    // {endList: { contains: query, mode: 'insensitive' }},
                ]
            }
        });
        
        // console.log(data);
        return data;
    } catch (e){
        console.log(e);
    }    
}

export async function fetchFilteredReservations(
    query: string, 
    currentPage:number,){

    noStore();
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try{
        // If I type in '100' in the search it better return all invoices that are $100, right?
        //Then I need to handle the typing.
        let data: LatestReservations; //This is just an array of reservations - whether it's the latest or all of them!
        if (/^\d+$/.test(query)){
            //This just searches for the exact value of course. I'm starting to get into like if someone types in 1, should that search for invoice of value 100 or 201? Idk it's an edge case.
            let queryNum = +query;
            data = await prisma.reservation.findMany({
                orderBy: [
                    {
                        id: 'desc',
                    }
                ],
                where: {
                    amount: { equals: queryNum },
                  }
            });
        } else {
            data = await prisma.reservation.findMany({
                skip: offset,
                take: ITEMS_PER_PAGE,
                orderBy: [
                    {
                        id: 'desc',
                    }
                ],
                where: {
                    OR: [
                        {childNames: { contains: query, mode: 'insensitive' }},
                        {customerName: { contains: query, mode: 'insensitive' }},
                        {email: { contains: query, mode: 'insensitive' }},
                        {notes: { contains: query, mode: 'insensitive' }},
                    ]
                }
            });
        }
        // console.log(data);
        return data;
    } catch (e){
        console.log(e);
    }    
}

export async function fetchSchedulesPages(query: string){
    noStore();
    try{
        let count = 0; 
        count = await prisma.schedule.count({
            where: {
                OR: [
                    {desc: { contains: query, mode: 'insensitive' }},
                    {name: { contains: query, mode: 'insensitive' }},
                    // {startList: { contains: query, mode: 'insensitive' }},
                    // {endList: { contains: query, mode: 'insensitive' }},
                ]
            }
        });
        
        console.log("count of schedules found:", count);
        // let totalPages = 0;//I'm getting a typeerror stating that this is undefined? Well, I'll define it here then to make a default.
        const totalPages = Math.ceil(count / ITEMS_PER_PAGE);
        console.log(typeof(totalPages));
        return totalPages;
    } catch(e){
        console.log(e);
    }

}

export async function fetchReservationById(id: number){
    noStore();
    try{
        const reservation = await prisma.reservation.findUnique({
            where:{ id: id },
        });

        if (!reservation){
            throw new Error("No reservations returned from the database?!?")
        }
//I want to convert reservation.amount from pennies to dollars but Typescript will have none of that.
//Some problem with Decimal type?
//I've turned off typescript error reporting for now so,
        reservation.amount = reservation.amount/100;
        return reservation;
    } catch(e){
        console.log(e);
    }
}

export async function fetchCardData(){
    noStore();//no caching - this is supposed to be a live readout.

    let reservationsThisYear;//all the actual records of reservations
    
    let thisYear = new Date().getFullYear();
    let start = new Date(`January 1, ${thisYear}`);
    
    let resThisYr;//how many reservations
    let custThisYr =0;

    let revThisYr =0;//rev for revenue
    let paymentOutst =0;

    try{
        //Prisma will return an array of object, not an object of objects.
        reservationsThisYear = await prisma.reservation.findMany(
            {
                where: {
                    createdAt:{
                        gte: start,
                    }
                }

            }
        );
        // console.log(reservationsThisYear);

        resThisYr = Object.keys(reservationsThisYear).length;

        let custNames = reservationsThisYear.map((el: Reservation)=>el.customerName);
        let custNamesSet = new Set(custNames);        
        custThisYr = custNamesSet.size;

        revThisYr = reservationsThisYear.map((el: Reservation) => +el.amount).reduce((a:number,c:number)=> a+c, 0);
        
        paymentOutst = reservationsThisYear.map((el: Reservation) => {
            if (el.paid==false){
                return +el.amount;
            } else {
                return 0;
            }
        }).reduce((a:number,c:number) => a+c,0);

        // console.log("payment values outstanding:", paymentOutst);
        // paymentOutst = paymentOutst.reduce((a:number,c:number)=>a+c,0);
        return {
            revThisYr,
            paymentOutst,
            resThisYr,
            custThisYr,
        }

    } catch(err) {
        console.log(err);
        throw new Error("trouble with card data");
    }

}
