import { Card, CardContent } from "@/components/ui/card";
import { Package2, CircleDashed } from "lucide-react";

interface StatsCardsProps {
  stats: {
    total: number;
    livre: number;
    incompleto: number;
    completo: number;
  };
  boxDDisponiveis: string[];
}

const StatsCards = ({ stats, boxDDisponiveis }: StatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
      <StatCard 
        title="Total de Viagem" 
        value={stats.total} 
        icon={<Package2 className="h-5 w-5" />}
        gradient="from-blue-50 to-blue-100 dark:from-blue-950/40 dark:to-blue-900/30"
        iconColor="text-blue-600 dark:text-blue-400"
        textColor="text-blue-700 dark:text-blue-300"
        small
      />
      <StatCard 
        title="Disponíveis" 
        value={stats.livre} 
        icon={<CircleDashed className="h-5 w-5" />}
        gradient="from-emerald-50 to-emerald-100 dark:from-emerald-950/40 dark:to-emerald-900/30"
        iconColor="text-emerald-600 dark:text-emerald-400"
        textColor="text-emerald-700 dark:text-emerald-300"
        boxDDisponiveis={boxDDisponiveis}
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
  boxDDisponiveis?: string[];
  small?: boolean;
}

const StatCard = ({ title, value, icon, gradient, iconColor, textColor, boxDDisponiveis, small }: StatCardProps) => {
  if (boxDDisponiveis && Array.isArray(boxDDisponiveis)) {
    const boxDPadrao = Array.from({ length: 32 }, (_, i) => (i + 1).toString());
    const boxDExtras = boxDDisponiveis.filter(num => !boxDPadrao.includes(num));
    

    
    return (
      <Card className={`bg-gradient-to-br ${gradient} border-none shadow-lg hover:shadow-xl transition-all duration-300`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">BOX-D disponíveis</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {/* BOX-D padrão (1-32) */}
            {boxDPadrao.map((num) => (
              <div
                key={num}
                className={`text-xs font-mono flex items-center justify-center rounded h-7 w-7 border transition-colors duration-200
                  ${boxDDisponiveis.includes(num)
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-gray-100 text-gray-300 border-gray-200 dark:bg-gray-800 dark:text-gray-700 dark:border-gray-700'}
                `}
              >
                {num}
              </div>
            ))}
            {/* BOX-D extras (além dos 32 padrão) em azul */}
            {boxDExtras.map((num) => (
              <div
                key={num}
                className="text-xs font-mono flex items-center justify-center rounded h-7 min-w-7 px-1 border transition-colors duration-200 bg-blue-500 text-white border-blue-600"
              >
                {num}
              </div>
            ))}
          </div>
          {boxDExtras.length > 0 && (
            <div className="mt-2">
              <span className="text-xs text-blue-600 dark:text-blue-400">
                {boxDExtras.length} BOX-D extra{boxDExtras.length > 1 ? 's' : ''} disponível{boxDExtras.length > 1 ? 'eis' : ''}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-gradient-to-br ${gradient} border-none shadow-lg hover:shadow-xl transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            {/* Remove o título para o card Disponíveis se for mostrar os BOX-D */}
            {boxDDisponiveis ? null : (
              <p className={`${textColor} text-sm font-medium`}>{title}</p>
            )}
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