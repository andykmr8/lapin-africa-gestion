import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp, TrendingDown, AlertTriangle, Plus, Calendar, Database } from 'lucide-react';
import { DatabaseService } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

interface KPIs {
  totalRabbits: number;
  readyForSale: number;
  breeders: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  monthlyProfit: number;
  lowStockItems: number;
}

const Dashboard: React.FC = () => {
  const [kpis, setKpis] = useState<KPIs>({
    totalRabbits: 0,
    readyForSale: 0,
    breeders: 0,
    monthlyRevenue: 0,
    monthlyExpenses: 0,
    monthlyProfit: 0,
    lowStockItems: 0
  });
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    loadKPIs();
  }, []);

  const loadKPIs = async () => {
    try {
      const data = await DatabaseService.getKPIs();
      setKpis(data);
    } catch (error) {
      console.error('Error loading KPIs:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors du chargement des données',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const handleAddRabbit = () => {
    // Placeholder for adding rabbit functionality
    toast({
      title: t('common.success'),
      description: 'Fonction "Ajouter lapin" sera disponible bientôt',
    });
  };

  const handleRecordSale = () => {
    // Placeholder for recording sale functionality
    toast({
      title: t('common.success'),
      description: 'Fonction "Enregistrer vente" sera disponible bientôt',
    });
  };

  const handleManageStock = () => {
    // Placeholder for managing stock functionality
    toast({
      title: t('common.success'),
      description: 'Fonction "Gérer stocks" sera disponible bientôt',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('dashboard.title')}</h2>
        <Button onClick={loadKPIs} variant="outline">
          <Calendar className="h-4 w-4 mr-2" />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">
              {t('dashboard.totalRabbits')}
            </CardTitle>
            <Database className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{kpis.totalRabbits}</div>
            <p className="text-xs text-blue-600 mt-1">Total du cheptel</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              {t('dashboard.readyForSale')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{kpis.readyForSale}</div>
            <p className="text-xs text-green-600 mt-1">Prêts pour la vente</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">
              {t('dashboard.breeders')}
            </CardTitle>
            <Plus className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-900">{kpis.breeders}</div>
            <p className="text-xs text-purple-600 mt-1">Reproducteurs actifs</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${kpis.lowStockItems > 0 ? 'from-red-50 to-red-100' : 'from-gray-50 to-gray-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${kpis.lowStockItems > 0 ? 'text-red-700' : 'text-gray-700'}`}>
              {t('dashboard.lowStock')}
            </CardTitle>
            <AlertTriangle className={`h-4 w-4 ${kpis.lowStockItems > 0 ? 'text-red-600' : 'text-gray-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${kpis.lowStockItems > 0 ? 'text-red-900' : 'text-gray-900'}`}>
              {kpis.lowStockItems}
            </div>
            <p className={`text-xs mt-1 ${kpis.lowStockItems > 0 ? 'text-red-600' : 'text-gray-600'}`}>
              Articles en rupture
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100">
          <CardHeader>
            <CardTitle className="text-emerald-700 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              {t('dashboard.monthlyRevenue')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-emerald-900">
              {formatCurrency(kpis.monthlyRevenue)}
            </div>
            <p className="text-sm text-emerald-600 mt-2">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center">
              <TrendingDown className="h-5 w-5 mr-2" />
              {t('dashboard.monthlyExpenses')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-900">
              {formatCurrency(kpis.monthlyExpenses)}
            </div>
            <p className="text-sm text-orange-600 mt-2">Ce mois-ci</p>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${kpis.monthlyProfit >= 0 ? 'from-green-50 to-green-100' : 'from-red-50 to-red-100'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center ${kpis.monthlyProfit >= 0 ? 'text-green-700' : 'text-red-700'}`}>
              {kpis.monthlyProfit >= 0 ? 
                <TrendingUp className="h-5 w-5 mr-2" /> : 
                <TrendingDown className="h-5 w-5 mr-2" />
              }
              {t('dashboard.monthlyProfit')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-3xl font-bold ${kpis.monthlyProfit >= 0 ? 'text-green-900' : 'text-red-900'}`}>
              {formatCurrency(kpis.monthlyProfit)}
            </div>
            <p className={`text-sm mt-2 ${kpis.monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Bénéfice net
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Plus className="h-5 w-5 mr-2" />
            {t('dashboard.quickActions')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-16 bg-green-600 hover:bg-green-700"
              onClick={handleAddRabbit}
            >
              <div className="text-center">
                <Plus className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">{t('dashboard.addRabbit')}</div>
              </div>
            </Button>
            
            <Button 
              className="h-16 bg-blue-600 hover:bg-blue-700"
              onClick={handleRecordSale}
            >
              <div className="text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">{t('dashboard.recordSale')}</div>
              </div>
            </Button>
            
            <Button 
              className="h-16 bg-purple-600 hover:bg-purple-700"
              onClick={handleManageStock}
            >
              <div className="text-center">
                <Database className="h-6 w-6 mx-auto mb-1" />
                <div className="text-sm">Gérer stocks</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      {kpis.lowStockItems > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {t('dashboard.alerts')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-red-800">
              ⚠️ {kpis.lowStockItems} article(s) en stock faible nécessitent votre attention
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
