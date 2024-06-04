// id        Int      @id @default(autoincrement())
// createdAt DateTime @default(now())
// updatedAt DateTime[]
// company   String   @db.VarChar(255)
// note      String   @db.VarChar(5000)
// status    Int
// //The authorId field in this table matches the id field in the User table. We call this relationship 'author'. This is one to many. One author many posts.
// author    User     @relation(fields: [authorId], references: [id])
// authorId  Int     

let bobScheduled = new Date('2024-05-07T17:00:00');
console.log("check bob's update date:", bobScheduled, typeof(bobScheduled));

const newRecords = [
    {
        company: "Bob Bobberson And Associates",
        note: "Post from Indeed.com (link). linkedin/in/bobBobberson bob@bobobberson.com. emailed: 'Hi Bob, I'm also a Bob so I thought I'd reach out! ...'",
        //"updated" includes a scheduled email being sent.
        updatedAt: [bobScheduled],
        status: 1,
        authorId: 1,
    },
    {
        company: "Tuft and Paw",
        note: "job ad on LinkedIn. Quick apply. contacted John, Luis and Diana on LinkedIn all with the same: 'I'm super into cats! Hey there, I saw your posted job ad for full stack cat app dev and wanted to express some keen interest! I am also a cat, and would love to join a great time like you have at Tuft and Paw. Do you have 15 minutes this week or next to talk about what I can make for your company?",
        status: 2,
        authorId: 3,
    },
    {
        company: "structura biotech",
        note: "responded to hackernews Who'sHiring. Emailed 3 pple at the company: gandalf@emicro.com, Steve@emmicro.com and ceo@structura.bio. gandalf: 'Hi Gandalf, wow great name do you experience time backwards? If so, you already know I'm a great choice! Haha, jokes aside I'd love the chance to combine both degrees into a job and write some python code to process your 2TB of images! That sounds like a challenge I can meet and I'd love to join your team. Do you have 15 minutes to talk about this some time next week?' ... ",
        status: 2,
        authorId: 5,
    },
    {
        company: "google",
        note: "Reach goal. My friend Holden works for them. Got referred, applied for a job here (link) from indeed.com and reached out to HR person holden put me in touch with: linkedin/in/stacycruz. 'Hi Stacy! I'll be on the google campus next week and was looking for great vegan places to eat - can you recommend anywhere? I don't know anybody there but I saw your posting about vegan stuff through my friend Holden and wanted to reach out to say hello!'",
        //This is a 0 status. That means the message hasn't actually been sent! That could be, for example, this was written late at night and you cannot schedule send messages on linkedIn. 
        status: 0,
        authorId: 4,
    },
];

// id      Int      @id @default(autoincrement())
// email   String   @unique
// name    String?
// password   String
// //You need to define the reciprocal relationships. It's not enough to define it in just one table. So here are the relationship entries for the user's records and profile
// records Record[]
// profile Profile?

const newUsers = [
    {
        id: 1,
        email:"bob@bobbitybob.com",
        name: "Bob Bobbity",
        password: "BobRules11!!1",
    },
    {
        id: 2,
        email:"Steve@bobbitybob.com",
        name: "Steve Bobbity",
        password: "BobSucks11!!1",
    },
    {
        id: 3,
        email:"Hardeep@bobbitybob.com",
        name: "Hardeep Bobbity",
        password: "HardeepRules11!!1",
    },
    {
        id: 4,
        email:"kathy@canva.com",
        name: "Kathy Bobberton",
        password: "correctstaplehorse",
    },
    {
        id: 5,
        email:"xk@cd.com",
        name: "black hat",
        password: "bobbyDropTables",
    }
];

// id     Int     @id @default(autoincrement())
// bio    String?
// //This will be an array of [firstFollowup, secondFollowup, thirdFollowup, OverdueFlagGrace]
// settingInt Int[]
// //PostgreSQL is fine with mixed int and strings in an array but Prisma cannot. So we have this for string settings
// timezone String
// //One to one relationship - only one profile per user. @unique means every profile has a unique userId.
// user   User    @relation(fields: [userId], references: [id])
// userId Int     @unique
const newProfiles = [
    {
        id: 1,
        bio: "hi I'm bob I'm new to this platform what does it do?",
        userId: 1,
        settingInt: [3,7,7,2],
        timezone: "PDT",
    },
    {
        id: 2,
        bio: "Been searching for a job for ages, hopefully this helps. Oh, I'm from San Fran, 33 yrs old. I was a taxi driver for 10 years.",
        userId: 2,
        settingInt: [3,7,7,2],
        timezone: "PDT",
    },
    {
        id: 3,
        bio: "hi I'm bob I'm new to this platform what does it do?",
        userId: 3,
        settingInt: [3,7,7,1],
        timezone: "GMT",
    },
    {
        id: 4,
        bio: "hi I'm bob I'm new to this platform what does it do?",
        userId: 4,
        settingInt: [3,7,9,2],
        timezone: "EST",
    },
    {
        id: 5,
        bio: "hi I'm bob I'm new to this platform what does it do?",
        userId:5,
        settingInt: [3,7,7,2],
        timezone: "PDT",
    },
];

const expectedFollowups = [
    {day:1,
    value:"5"},
    {day:2,
    value:"4"},
    {day:3,
    value:"5"},
    {day:4,
    value:"6"},
    {day:5,
    value:"2"},
    {day:6,
    value:"1"},
    {day:7,
    value:"7"},
] 

module.exports = {
    newRecords,
    newUsers,
    newProfiles,
    expectedFollowups,
}