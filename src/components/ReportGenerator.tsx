
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Calendar, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { DatabaseService, type Rabbit, type Finance, type Stock } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

interface ReportData {
  rabbits: Rabbit[];
  finances: Finance[];
  stocks: Stock[];
  period: string;
  startDate: Date;
  endDate: Date;
}

const ReportGenerator: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<string>('thisMonth');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const { toast } = useToast();

  const generateReport = async () => {
    setLoading(true);
    try {
      const [rabbits, finances, stocks] = await Promise.all([
        DatabaseService.getRabbits(),
        DatabaseService.getFinances(),
        DatabaseService.getStocks()
      ]);

      const { startDate, endDate } = getPeriodDates(period);
      
      const filteredFinances = finances.filter(f => {
        const financeDate = new Date(f.date);
        return financeDate >= startDate && financeDate <= endDate;
      });

      setReportData({
        rabbits,
        finances: filteredFinances,
        stocks,
        period,
        startDate,
        endDate
      });

      toast({
        title: t('common.success'),
        description: 'Rapport généré avec succès'
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

  const getPeriodDates = (period: string) => {
    const now = new Date();
    let startDate: Date;
    let endDate: Date = new Date(now);

    switch (period) {
      case 'thisWeek':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    return { startDate, endDate };
  };

  const exportReport = () => {
    if (!reportData) return;

    const reportContent = {
      periode: getPeriodLabel(reportData.period),
      dateGeneration: new Date().toISOString(),
      resume: {
        totalLapins: reportData.rabbits.length,
        pretsVente: reportData.rabbits.filter(r => r.statut === 'pret_vente').length,
        reproducteurs: reportData.rabbits.filter(r => r.statut === 'reproducteur').length,
        totalVentes: reportData.finances.filter(f => f.type === 'vente').reduce((sum, f) => sum + f.montant, 0),
        totalAchats: reportData.finances.filter(f => f.type === 'achat').reduce((sum, f) => sum + f.montant, 0),
        stocksBas: reportData.stocks.filter(s => s.quantite <= s.seuil_alerte).length
      },
      detailsLapins: reportData.rabbits,
      detailsFinances: reportData.finances,
      detailsStocks: reportData.stocks
    };

    const dataStr = JSON.stringify(reportContent, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `rapport-cunigestion-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    toast({
      title: t('common.success'),
      description: 'Rapport exporté avec succès'
    });
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'thisWeek': return 'Cette semaine';
      case 'thisMonth': return 'Ce mois';
      case 'thisYear': return 'Cette année';
      default: return 'Période inconnue';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const calculateStatistics = () => {
    if (!reportData) return null;

    const totalVentes = reportData.finances
      .filter(f => f.type === 'vente')
      .reduce((sum, f) => sum + f.montant, 0);

    const totalAchats = reportData.finances
      .filter(f => f.type === 'achat')
      .reduce((sum, f) => sum + f.montant, 0);

    const benefice = totalVentes - totalAchats;

    const rabbitStats = {
      total: reportData.rabbits.length,
      jeunes: reportData.rabbits.filter(r => r.statut === 'jeune').length,
      sevres: reportData.rabbits.filter(r => r.statut === 'sevre').length,
      pretsVente: reportData.rabbits.filter(r => r.statut === 'pret_vente').length,
      reproducteurs: reportData.rabbits.filter(r => r.statut === 'reproducteur').length,
      malades: reportData.rabbits.filter(r => r.statut === 'malade').length,
      vendus: reportData.rabbits.filter(r => r.statut === 'vendu').length
    };

    const stockStats = {
      total: reportData.stocks.length,
      alertes: reportData.stocks.filter(s => s.quantite <= s.seuil_alerte).length,
      valeurTotale: reportData.stocks.reduce((sum, s) => sum + (s.quantite * s.prix_unitaire), 0)
    };

    return {
      finances: { totalVentes, totalAchats, benefice },
      rabbits: rabbitStats,
      stocks: stockStats
    };
  };

  const stats = calculateStatistics();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('reports.title')}</h2>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <BarChart3 className="h-5 w-5 mr-2" />
            Configuration du rapport
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2">{t('reports.period')}</label>
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="thisWeek">{t('reports.thisWeek')}</SelectItem>
                  <SelectItem value="thisMonth">{t('reports.thisMonth')}</SelectItem>
                  <SelectItem value="thisYear">{t('reports.thisYear')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={generateReport} 
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              {t('reports.generate')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Results */}
      {reportData && stats && (
        <>
          {/* Report Header */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2" />
                    Rapport - {getPeriodLabel(reportData.period)}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    Du {reportData.startDate.toLocaleDateString('fr-FR')} au {reportData.endDate.toLocaleDateString('fr-FR')}
                  </p>
                </div>
                <Button onClick={exportReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
          </Card>

          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Ventes</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">
                  {formatCurrency(stats.finances.totalVentes)}
                </div>
                <p className="text-xs text-green-600 mt-1">
                  {reportData.finances.filter(f => f.type === 'vente').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Achats</CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">
                  {formatCurrency(stats.finances.totalAchats)}
                </div>
                <p className="text-xs text-red-600 mt-1">
                  {reportData.finances.filter(f => f.type === 'achat').length} transactions
                </p>
              </CardContent>
            </Card>

            <Card className={`bg-gradient-to-br ${stats.finances.benefice >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className={`text-sm font-medium ${stats.finances.benefice >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
                  Bénéfice
                </CardTitle>
                <TrendingUp className={`h-4 w-4 ${stats.finances.benefice >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${stats.finances.benefice >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
                  {formatCurrency(stats.finances.benefice)}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rabbit Statistics */}
          <Card>
            <CardHeader>
              <CardTitle>Statistiques des lapins</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.rabbits.total}</div>
                  <div className="text-sm text-gray-600">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{stats.rabbits.pretsVente}</div>
                  <div className="text-sm text-gray-600">Prêts vente</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{stats.rabbits.reproducteurs}</div>
                  <div className="text-sm text-gray-600">Reproducteurs</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.rabbits.malades}</div>
                  <div className="text-sm text-gray-600">Malades</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stock Summary */}
          <Card>
            <CardHeader>
              <CardTitle>État des stocks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{stats.stocks.total}</div>
                  <div className="text-sm text-gray-600">Articles en stock</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{stats.stocks.alertes}</div>
                  <div className="text-sm text-gray-600">Alertes stock bas</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(stats.stocks.valeurTotale)}
                  </div>
                  <div className="text-sm text-gray-600">Valeur totale</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          {reportData.finances.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Transactions de la période</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {reportData.finances.slice(0, 10).map((finance) => (
                    <div key={finance.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{finance.description}</div>
                        <div className="text-sm text-gray-600">
                          {finance.categorie} • {new Date(finance.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={finance.type === 'vente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {finance.type === 'vente' ? 'Vente' : 'Achat'}
                        </Badge>
                        <div className={`font-bold ${finance.type === 'vente' ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(finance.montant)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {!reportData && (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Générer un rapport</h3>
            <p className="text-gray-600 mb-4">
              Sélectionnez une période et cliquez sur "Générer rapport" pour voir les statistiques
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ReportGenerator;
