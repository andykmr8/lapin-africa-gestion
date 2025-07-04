
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Plus, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { DatabaseService, type Finance } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

const FinanceManager: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    type: 'vente' as 'vente' | 'achat',
    montant: 0,
    description: '',
    date: new Date().toISOString().split('T')[0],
    categorie: ''
  });

  useEffect(() => {
    loadFinances();
  }, []);

  const loadFinances = async () => {
    try {
      const data = await DatabaseService.getFinances();
      // Trier par date décroissante
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setFinances(sortedData);
    } catch (error) {
      console.error('Error loading finances:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors du chargement des finances',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || formData.montant <= 0) {
      toast({
        title: t('common.error'),
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    try {
      await DatabaseService.addFinance(formData);
      
      toast({
        title: t('common.success'),
        description: 'Transaction ajoutée avec succès'
      });

      setFormData({
        type: 'vente',
        montant: 0,
        description: '',
        date: new Date().toISOString().split('T')[0],
        categorie: ''
      });
      
      setShowAddForm(false);
      loadFinances();
    } catch (error) {
      console.error('Error adding finance:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors de l\'ajout de la transaction',
        variant: 'destructive'
      });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  const calculateTotals = () => {
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const thisMonthFinances = finances.filter(f => {
      const financeDate = new Date(f.date);
      return financeDate.getMonth() === thisMonth && financeDate.getFullYear() === thisYear;
    });

    const totalRevenue = thisMonthFinances
      .filter(f => f.type === 'vente')
      .reduce((sum, f) => sum + f.montant, 0);

    const totalExpenses = thisMonthFinances
      .filter(f => f.type === 'achat')
      .reduce((sum, f) => sum + f.montant, 0);

    return {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('finances.title')}</h2>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('finances.add')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('finances.add')}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="type">{t('finances.type')}</Label>
                <Select value={formData.type} onValueChange={(value: 'vente' | 'achat') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vente">{t('finances.type_vente')}</SelectItem>
                    <SelectItem value="achat">{t('finances.type_achat')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="montant">{t('finances.amount')} (FCFA) *</Label>
                <Input
                  id="montant"
                  type="number"
                  value={formData.montant}
                  onChange={(e) => setFormData({...formData, montant: parseFloat(e.target.value) || 0})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="description">{t('finances.description')} *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Description de la transaction..."
                  required
                />
              </div>

              <div>
                <Label htmlFor="date">{t('finances.date')} *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="categorie">{t('finances.category')}</Label>
                <Input
                  id="categorie"
                  value={formData.categorie}
                  onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                  placeholder="Ex: Vente lapins, Achat aliments..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  {t('common.cancel')}
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">
              Revenus ce mois
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {formatCurrency(totals.totalRevenue)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-700">
              Dépenses ce mois
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">
              {formatCurrency(totals.totalExpenses)}
            </div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${totals.profit >= 0 ? 'from-blue-50 to-blue-100' : 'from-red-50 to-red-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${totals.profit >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
              Bénéfice ce mois
            </CardTitle>
            {totals.profit >= 0 ? 
              <TrendingUp className="h-4 w-4 text-blue-600" /> : 
              <TrendingDown className="h-4 w-4 text-red-600" />
            }
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totals.profit >= 0 ? 'text-blue-900' : 'text-red-900'}`}>
              {formatCurrency(totals.profit)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {finances.map((finance) => (
              <div key={finance.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-full ${finance.type === 'vente' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {finance.type === 'vente' ? 
                      <TrendingUp className={`h-4 w-4 text-green-600`} /> : 
                      <TrendingDown className={`h-4 w-4 text-red-600`} />
                    }
                  </div>
                  
                  <div>
                    <div className="font-medium">{finance.description}</div>
                    <div className="text-sm text-gray-600 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" />
                      {new Date(finance.date).toLocaleDateString('fr-FR')}
                      {finance.categorie && (
                        <>
                          <span className="mx-2">•</span>
                          <Badge variant="outline">{finance.categorie}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`font-bold ${finance.type === 'vente' ? 'text-green-600' : 'text-red-600'}`}>
                    {finance.type === 'vente' ? '+' : '-'}{formatCurrency(finance.montant)}
                  </div>
                  <Badge className={finance.type === 'vente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                    {t(`finances.type_${finance.type}`)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          {finances.length === 0 && (
            <div className="text-center py-8">
              <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">Aucune transaction enregistrée</p>
              <p className="text-sm text-gray-400 mt-1">Ajoutez vos premières ventes ou achats</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinanceManager;
