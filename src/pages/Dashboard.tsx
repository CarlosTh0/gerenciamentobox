import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CargaItem } from "@/components/CargasTable";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const LOCAL_STORAGE_KEY = 'cargo-management-data';

const Dashboard = () => {
  const [data, setData] = useState<CargaItem[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [boxDUtilization, setBoxDUtilization] = useState<any[]>([]);
  const [timeDistribution, setTimeDistribution] = useState<any[]>([]);

  useEffect(() => {
    const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData);
        setData(parsedData);
      } catch (error) {
        console.error("Error loading data from localStorage:", error);
      }
    }
  }, []);

  useEffect(() => {
    if (data.length > 0) {
      // Status distribution
      const statusCount = {
        LIVRE: 0,
        COMPLETO: 0,
        PARCIAL: 0,
        JA_FOI: 0,
      };

      data.forEach(item => {
        if (statusCount.hasOwnProperty(item.status)) {
          statusCount[item.status as keyof typeof statusCount]++;
        }
      });

      setStatusData([
        { name: 'LIVRE', value: statusCount.LIVRE, color: '#10b981' },
        { name: 'COMPLETO', value: statusCount.COMPLETO, color: '#3b82f6' },
        { name: 'PARCIAL', value: statusCount.PARCIAL, color: '#8b5cf6' },
        { name: 'JA FOI', value: statusCount.JA_FOI, color: '#f59e0b' },
      ]);

      // Box-D utilization
      const boxDCount: Record<string, number> = {};
      data.forEach(item => {
        if (item["BOX-D"] && item.status !== "JA_FOI") {
          boxDCount[item["BOX-D"]] = (boxDCount[item["BOX-D"]] || 0) + 1;
        }
      });

      const boxDArray = Object.entries(boxDCount)
        .map(([boxD, count]) => ({ boxD, count }))
        .sort((a, b) => parseInt(a.boxD) - parseInt(b.boxD))
        .slice(0, 10); // Top 10 most used

      setBoxDUtilization(boxDArray);

      // Time distribution
      const hourCount: Record<string, number> = {};
      data.forEach(item => {
        if (item.HORA && typeof item.HORA === 'string') {
          const hourParts = item.HORA.split(':');
          if (hourParts.length > 0) {
            const hour = hourParts[0];
            hourCount[hour] = (hourCount[hour] || 0) + 1;
          }
        }
      });

      const hourArray = Array.from({ length: 24 }, (_, i) => {
        const hour = i.toString().padStart(2, '0');
        return {
          hour: `${hour}h`,
          count: hourCount[hour] || 0
        };
      });

      setTimeDistribution(hourArray);
    }
  }, [data]);

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b'];

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard de Estatísticas</h1>
        <p className="text-muted-foreground">
          Visualização de métricas e desempenho do sistema de gerenciamento de cargas
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Cargas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cargas Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-500">
              {data.filter(item => item.status === "LIVRE").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cargas Completas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              {data.filter(item => item.status === "COMPLETO").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cargas Parciais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-500">
              {data.filter(item => item.status === "PARCIAL").length}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribuição de Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} cargas`, 'Quantidade']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Utilização de BOX-D (Top 10)</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={boxDUtilization}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="boxD" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} cargas`, 'Quantidade']} />
                <Legend />
                <Bar dataKey="count" name="Quantidade" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição de Cargas por Hora</CardTitle>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={timeDistribution}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} cargas`, 'Quantidade']} />
              <Legend />
              <Bar dataKey="count" name="Quantidade" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
