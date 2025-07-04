
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Download, TrendingUp, Database, Package } from 'lucide-react';
import { DatabaseService } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  period: string;
  totalRabbits: number;
  sales: number;
  revenue: number;
  expenses: number;
  profit: number;
  stockValue: number;
  rabbitsByStatus: { [key: string]: number };
  topExpenseCategories: Array<{ category: string; amount: number }>;
}

const ReportGenerator: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState('thisMonth');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  useEffect(() => {
    generateReport();
  }, [period]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const [rabbits, finances, stocks] = await Promise.all([
        DatabaseService.getRabbits(),
        DatabaseService.getFinances(),
        DatabaseService.getStocks()
      ]);

      const now = new Date();
      let startDate: Date;
      let periodLabel: string;

      switch (period) {
        case 'thisWeek':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
          periodLabel = 'Cette semaine';
          break;
        case 'thisMonth':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          periodLabel = 'Ce mois';
          break;
        case 'thisYear':
          startDate = new Date(now.getFullYear(), 0, 1);
          periodLabel = 'Cette année';
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          periodLabel = 'Ce mois';
      }

      // Filtrer les finances par période
      const periodFinances = finances.filter(f => new Date(f.date) >= startDate);
      
      const sales = periodFinances.filter(f => f.type === 'vente');
      const expenses = periodFinances.filter(f => f.type === 'achat');

      const totalRevenue = sales.reduce((sum, f) => sum + f.montant, 0);
      const totalExpenses = expenses.reduce((sum, f) => sum + f.montant, 0);

      // Calculer la valeur du stock
      const stockValue = stocks.reduce((sum, s) => sum + (s.quantite * s.prix_unitaire), 0);

      // Statistiques par statut de lapins
      const rabbitsByStatus = rabbits.reduce((acc, rabbit) => {
        acc[rabbit.statut] = (acc[rabbit.statut] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Top catégories de dépenses
      const expensesByCategory = expenses.reduce((acc, expense) => {
        const category = expense.categorie || 'Non catégorisé';
        acc[category] = (acc[category] || 0) + expense.montant;
        return acc;
      }, {} as { [key: string]: number });

      const topExpenseCategories = Object.entries(expensesByCategory)
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

      setReportData({
        period: periodLabel,
        totalRabbits: rabbits.length,
        sales: sales.length,
        revenue: totalRevenue,
        expenses: totalExpenses,
        profit: totalRevenue - totalExpenses,
        stockValue,
        rabbitsByStatus,
        topExpenseCategories
      });

    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors de la génération du rapport',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const exportToPDF = () => {
    toast({
      title: 'Export PDF',
      description: 'Fonctionnalité en cours de développement'
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'jeune': 'Jeunes',
      'sevre': 'Sevrés',
      'pret_vente': 'Prêts vente',
      'reproducteur': 'Reproducteurs',
      'malade': 'Malades',
      'vendu': 'Vendus'
    };
    return labels[status] || status;
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
        <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>
        
        <div className="flex space-x-4">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="thisWeek">{t('reports.thisWeek')}</SelectItem>
              <SelectItem value="thisMonth">{t('reports.thisMonth')}</SelectItem>
              <SelectItem value="thisYear">{t('reports.thisYear')}</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={exportToPDF} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exporter PDF
          </Button>
        </div>
      </div>

      {reportData && (
        <>
          {/* En-tête du rapport */}
          <Card className="bg-gradient-to-r from-green-50 to-blue-50">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                Rapport CuniGestion - {reportData.period}
              </CardTitle>
              <p className="text-center text-gray-600">
                Généré le {new Date().toLocaleDateString('fr-FR')}
              </p>
            </CardHeader>
          </Card>

          {/* Métriques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Total Lapins
                </CardTitle>
                <Database className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{reportData.totalRabbits}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">
                  Ventes
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{reportData.sales}</div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">
                  Chiffre d'affaires
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-purple-900">
                  {formatCurrency(reportData.revenue)}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-700">
                  Valeur Stock
                </CardTitle>
                <Package className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold text-orange-900">
                  {formatCurrency(reportData.stockValue)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Résumé financier */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé Financier - {reportData.period}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reportData.revenue)}
                  </div>
                  <div className="text-sm text-green-700">Revenus</div>
                </div>
                
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {formatCurrency(reportData.expenses)}
                  </div>
                  <div className="text-sm text-red-700">Dépenses</div>
                </div>
                
                <div className={`text-center p-4 rounded-lg ${reportData.profit >= 0 ? 'bg-blue-50' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${reportData.profit >= 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {formatCurrency(reportData.profit)}
                  </div>
                  <div className={`text-sm ${reportData.profit >= 0 ? 'text-blue-700' : 'text-gray-700'}`}>
                    Bénéfice Net
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Distribution des lapins par statut */}
          <Card>
            <CardHeader>
              <CardTitle>Répartition du Cheptel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(reportData.rabbitsByStatus).map(([status, count]) => (
                  <div key={status} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl font-bold">{count}</div>
                    <div className="text-sm text-gray-600">{getStatusLabel(status)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Top catégories de dépenses */}
          {reportData.topExpenseCategories.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Principales Catégories de Dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.topExpenseCategories.map((category, index) => (
                    <div key={category.category} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                          #{index + 1}
                        </div>
                        <span className="font-medium">{category.category}</span>
                      </div>
                      <span className="font-bold text-red-600">
                        {formatCurrency(category.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recommandations */}
          <Card className="bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-800">Recommandations</CardTitle>
            </CardHeader>
            <CardContent className="text-blue-700">
              <ul className="space-y-2 text-sm">
                {reportData.profit < 0 && (
                  <li>⚠️ Attention: Votre bénéfice est négatif. Analysez vos dépenses.</li>
                )}
                {reportData.rabbitsByStatus['pret_vente'] > 10 && (
                  <li>💡 Vous avez {reportData.rabbitsByStatus['pret_vente']} lapins prêts à la vente. Planifiez vos ventes.</li>
                )}
                {reportData.rabbitsByStatus['reproducteur'] < 2 && (
                  <li>📈 Pensez à garder plus de reproducteurs pour développer votre cheptel.</li>
                )}
                {reportData.sales === 0 && (
                  <li>🎯 Aucune vente enregistrée cette période. Recherchez de nouveaux débouchés.</li>
                )}
              </ul>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default ReportGenerator;
