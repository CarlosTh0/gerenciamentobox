
import { Card, CardContent } from "@/components/ui/card";
import { Package2, CircleCheck, Loader2, CircleDashed } from "lucide-react";

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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard 
        title="Total de Cegonheiras" 
        value={stats.total} 
        icon={<Package2 className="h-5 w-5" />}
        gradient="from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
        textColor="text-blue-700 dark:text-blue-300"
      />
      <StatCard 
        title="Disponíveis" 
        value={stats.livre} 
        icon={<CircleDashed className="h-5 w-5" />}
        gradient="from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        textColor="text-emerald-700 dark:text-emerald-300"
      />
      <StatCard 
        title="Em Carregamento" 
        value={stats.incompleto} 
        icon={<Loader2 className="h-5 w-5" />}
        gradient="from-purple-50 to-purple-100 dark:from-purple-950/40 dark:to-purple-900/30"
        iconColor="text-purple-600 dark:text-purple-400"
        textColor="text-purple-700 dark:text-purple-300"
      />
      <StatCard 
        title="Completadas" 
        value={stats.completo} 
        icon={<CircleCheck className="h-5 w-5" />}
        gradient="from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10"
        iconColor="text-primary dark:text-primary"
        textColor="text-primary-foreground dark:text-primary-foreground"
      />
    </div>
  );
};

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  gradient: string;
  iconColor: string;
  textColor: string;
}

const StatCard = ({ title, value, icon, gradient, iconColor, textColor }: StatCardProps) => {
  return (
    <Card className={`bg-gradient-to-br ${gradient} border-none shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className={`${textColor} text-sm font-medium`}>{title}</p>
            <p className={`${textColor} text-3xl font-bold`}>{value}</p>
          </div>
          <div className={`${iconColor} p-3 rounded-xl bg-white/50 dark:bg-black/20`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCards;
