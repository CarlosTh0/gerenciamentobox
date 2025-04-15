
import { Card, CardContent } from "@/components/ui/card";
import { CircleCheck, Loader2, Package2, CircleDashed } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
      <StatCard 
        title="Total" 
        value={stats.total} 
        icon={<Package2 className="h-5 w-5" />}
        bgGradient="from-blue-50 to-blue-100" 
        iconColor="text-blue-600" 
        textColor="text-blue-700" 
      />
      <StatCard 
        title="LIVRE" 
        value={stats.livre} 
        icon={<CircleDashed className="h-5 w-5" />}
        bgGradient="from-emerald-50 to-emerald-100" 
        iconColor="text-emerald-600" 
        textColor="text-emerald-700" 
      />
      <StatCard 
        title="INCOMPLETO" 
        value={stats.incompleto} 
        icon={<Loader2 className="h-5 w-5" />}
        bgGradient="from-amber-50 to-amber-100" 
        iconColor="text-amber-600" 
        textColor="text-amber-700" 
      />
      <StatCard 
        title="COMPLETO" 
        value={stats.completo} 
        icon={<CircleCheck className="h-5 w-5" />}
        bgGradient="from-purple-50 to-purple-100" 
        iconColor="text-purple-600" 
        textColor="text-purple-700" 
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  bgGradient: string;
  iconColor: string;
  textColor: string;
}

const StatCard = ({ title, value, icon, bgGradient, iconColor, textColor }: StatCardProps) => {
  return (
    <Card className={`bg-gradient-to-br ${bgGradient} border-none shadow-sm hover:shadow-md transition-shadow duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className={`${textColor} text-sm font-medium uppercase tracking-wider`}>{title}</p>
            <p className={`${textColor} text-3xl font-bold mt-1`}>{value}</p>
          </div>
          <div className={`${iconColor} p-3 rounded-full bg-white/50`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCards;
