
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
        bgGradient="from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30" 
        iconColor="text-blue-600 dark:text-blue-400" 
        textColor="text-blue-700 dark:text-blue-300" 
      />
      <StatCard 
        title="LIVRE" 
        value={stats.livre} 
        icon={<CircleDashed className="h-5 w-5" />}
        bgGradient="from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30" 
        iconColor="text-emerald-600 dark:text-emerald-400" 
        textColor="text-emerald-700 dark:text-emerald-300" 
      />
      <StatCard 
        title="PARCIAL" 
        value={stats.incompleto} 
        icon={<Loader2 className="h-5 w-5" />}
        bgGradient="from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30" 
        iconColor="text-purple-600 dark:text-purple-400" 
        textColor="text-purple-700 dark:text-purple-300" 
      />
      <StatCard 
        title="COMPLETO/JA FOI" 
        value={stats.completo} 
        icon={<CircleCheck className="h-5 w-5" />}
        bgGradient="from-amber-50 to-amber-100 dark:from-amber-950/40 dark:to-amber-900/30" 
        iconColor="text-amber-600 dark:text-amber-400" 
        textColor="text-amber-700 dark:text-amber-300" 
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
          <div className={`${iconColor} p-3 rounded-full bg-white/50 dark:bg-black/20`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCards;
