
interface StatsCardsProps {
  stats: {
    total: number;
    livre: number;
    incompleto: number;
    completo: number;
  };
}

const StatsCards = ({ stats }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 my-6">
      <StatCard title="Total" value={stats.total} bgColor="bg-blue-50" textColor="text-blue-500" />
      <StatCard title="LIVRE" value={stats.livre} bgColor="bg-blue-50" textColor="text-blue-500" />
      <StatCard title="INCOMPLETO" value={stats.incompleto} bgColor="bg-blue-50" textColor="text-blue-500" />
      <StatCard title="COMPLETO" value={stats.completo} bgColor="bg-blue-50" textColor="text-blue-500" />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  bgColor: string;
  textColor: string;
}

const StatCard = ({ title, value, bgColor, textColor }: StatCardProps) => {
  return (
    <div className={`${bgColor} p-4 rounded-md shadow-sm`}>
      <h3 className={`${textColor} font-bold text-center`}>{title}</h3>
      <p className={`${textColor} text-2xl font-bold text-center mt-2`}>
        {`{{ ${title.toLowerCase()} }}`}
      </p>
    </div>
  );
};

export default StatsCards;
