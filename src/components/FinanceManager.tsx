
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, Edit, Trash2, DollarSign } from 'lucide-react';
import { DatabaseService, type Finance } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

const CATEGORIES = {
  vente: ['Vente lapins', 'Vente reproducteurs', 'Autres ventes'],
  achat: ['Alimentation', 'Médicaments', 'Matériel', 'Transport', 'Frais vétérinaires', 'Autres achats']
};

const FinanceManager: React.FC = () => {
  const [finances, setFinances] = useState<Finance[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>('all');
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
      setFinances(data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
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

  const resetForm = () => {
    setFormData({
      type: 'vente',
      montant: 0,
      description: '',
      date: new Date().toISOString().split('T')[0],
      categorie: ''
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.description || !formData.categorie || formData.montant <= 0) {
      toast({
        title: t('common.error'),
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingFinance) {
        await DatabaseService.deleteFinance(editingFinance.id!);
        await DatabaseService.addFinance(formData);
        toast({
          title: t('common.success'),
          description: 'Transaction modifiée avec succès'
        });
        setShowEditForm(false);
        setEditingFinance(null);
      } else {
        await DatabaseService.addFinance(formData);
        toast({
          title: t('common.success'),
          description: 'Transaction ajoutée avec succès'
        });
        setShowAddForm(false);
      }

      resetForm();
      loadFinances();
    } catch (error) {
      console.error('Error saving finance:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors de l\'enregistrement',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (finance: Finance) => {
    setEditingFinance(finance);
    setFormData({
      type: finance.type,
      montant: finance.montant,
      description: finance.description,
      date: finance.date,
      categorie: finance.categorie
    });
    setShowEditForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette transaction ?')) {
      try {
        await DatabaseService.deleteFinance(id);
        toast({
          title: t('common.success'),
          description: 'Transaction supprimée avec succès'
        });
        loadFinances();
      } catch (error) {
        console.error('Error deleting finance:', error);
        toast({
          title: t('common.error'),
          description: 'Erreur lors de la suppression',
          variant: 'destructive'
        });
      }
    }
  };

  const filteredFinances = typeFilter === 'all' 
    ? finances 
    : finances.filter(f => f.type === typeFilter);

  const totalVentes = finances
    .filter(f => f.type === 'vente')
    .reduce((sum, f) => sum + f.montant, 0);

  const totalAchats = finances
    .filter(f => f.type === 'achat')
    .reduce((sum, f) => sum + f.montant, 0);

  const benefice = totalVentes - totalAchats;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const FinanceForm = ({ isEdit = false }: { isEdit?: boolean }) => (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="type">{t('finances.type')} *</Label>
        <Select value={formData.type} onValueChange={(value: 'vente' | 'achat') => {
          setFormData({...formData, type: value, categorie: ''});
        }}>
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
        <Label htmlFor="categorie">{t('finances.category')} *</Label>
        <Select value={formData.categorie} onValueChange={(value) => setFormData({...formData, categorie: value})}>
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une catégorie" />
          </SelectTrigger>
          <SelectContent>
            {CATEGORIES[formData.type].map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
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
          min="0"
          step="1"
        />
      </div>

      <div>
        <Label htmlFor="description">{t('finances.description')} *</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          required
          placeholder="Description de la transaction"
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

      <div className="flex justify-end space-x-2 pt-4">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            if (isEdit) {
              setShowEditForm(false);
              setEditingFinance(null);
            } else {
              setShowAddForm(false);
            }
            resetForm();
          }}
        >
          {t('common.cancel')}
        </Button>
        <Button type="submit" className="bg-green-600 hover:bg-green-700">
          {t('common.save')}
        </Button>
      </div>
    </form>
  );

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
            <FinanceForm />
          </DialogContent>
        </Dialog>

        <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Modifier la transaction</DialogTitle>
            </DialogHeader>
            <FinanceForm isEdit={true} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Total Ventes</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(totalVentes)}</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Total Achats</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-900">{formatCurrency(totalAchats)}</div>
          </CardContent>
        </Card>

        <Card className={`bg-gradient-to-br ${benefice >= 0 ? 'from-blue-50 to-blue-100' : 'from-orange-50 to-orange-100'}`}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className={`text-sm font-medium ${benefice >= 0 ? 'text-blue-700' : 'text-orange-700'}`}>
              Bénéfice Net
            </CardTitle>
            <DollarSign className={`h-4 w-4 ${benefice >= 0 ? 'text-blue-600' : 'text-orange-600'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${benefice >= 0 ? 'text-blue-900' : 'text-orange-900'}`}>
              {formatCurrency(benefice)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="pt-6">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les transactions</SelectItem>
              <SelectItem value="vente">Ventes uniquement</SelectItem>
              <SelectItem value="achat">Achats uniquement</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <div className="space-y-4">
        {filteredFinances.map((finance) => (
          <Card key={finance.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge className={finance.type === 'vente' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                      {finance.type === 'vente' ? 'Vente' : 'Achat'}
                    </Badge>
                    <span className="text-sm text-gray-600">{finance.categorie}</span>
                  </div>
                  
                  <h4 className="font-medium text-lg mb-2">{finance.description}</h4>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {new Date(finance.date).toLocaleDateString('fr-FR')}
                    </span>
                    <span className={`text-xl font-bold ${finance.type === 'vente' ? 'text-green-600' : 'text-red-600'}`}>
                      {finance.type === 'vente' ? '+' : '-'}{formatCurrency(finance.montant)}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(finance)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(finance.id!)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFinances.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucune transaction trouvée</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez vos premières transactions</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default FinanceManager;
