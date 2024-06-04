import { lusitana } from '@/app/ui/fonts';
import { fetchCardData } from '@/app/lib/getter';

export default async function CardWrapper() {
//Not sure what's wrong here but I'm having trouble destructuring or something?
  const {
    msgsThisWeek,
    quote,
    msgsSentTotal,
   } = await fetchCardData();

// //dummy data
//     let msgsThisWeek = 10;
//     let quote = "Badger always follows up!";
//     let msgsSentTotal = 15;
  return (
    <>
        <Card title="Sent This Week" value={`${msgsThisWeek}`}/>
        <Card title="Quote" value={`${quote}`}/>
        <Card title="Total Messages Sent" value={`${msgsSentTotal}`} />
    </>
  );
}

export function Card({title,value}) {
  return (
    <div className="rounded-xl bg-gray-50 p-2 shadow-sm">
      <div className="flex p-4">
        <h3 className="ml-2 text-sm font-medium">{title}</h3>
      </div>
      <p
        className={`${lusitana.className}
          truncate rounded-xl bg-white px-4 py-8 text-center text-2xl`}
      >
        {value}
      </p>
    </div>
  );
}
