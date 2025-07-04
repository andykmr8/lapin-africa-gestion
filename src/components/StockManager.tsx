
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, AlertTriangle, Package } from 'lucide-react';
import { DatabaseService, type Stock } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

const StockManager: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    nom: '',
    type: 'aliment' as 'aliment' | 'medicament' | 'materiel',
    quantite: 0,
    unite: '',
    seuil_alerte: 0,
    prix_unitaire: 0,
    fournisseur: ''
  });

  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      const data = await DatabaseService.getStocks();
      setStocks(data);
    } catch (error) {
      console.error('Error loading stocks:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors du chargement des stocks',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.unite) {
      toast({
        title: t('common.error'),
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    try {
      await DatabaseService.addStock(formData);
      
      toast({
        title: t('common.success'),
        description: 'Stock ajouté avec succès'
      });

      setFormData({
        nom: '',
        type: 'aliment',
        quantite: 0,
        unite: '',
        seuil_alerte: 0,
        prix_unitaire: 0,
        fournisseur: ''
      });
      
      setShowAddForm(false);
      loadStocks();
    } catch (error) {
      console.error('Error adding stock:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors de l\'ajout du stock',
        variant: 'destructive'
      });
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'aliment': return 'bg-green-100 text-green-800';
      case 'medicament': return 'bg-red-100 text-red-800';
      case 'materiel': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isLowStock = (stock: Stock) => {
    return stock.quantite <= stock.seuil_alerte;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const lowStockItems = stocks.filter(isLowStock);
  const regularStockItems = stocks.filter(stock => !isLowStock(stock));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">{t('stocks.title')}</h2>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('stocks.add')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('stocks.add')}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">{t('stocks.name')} *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="type">{t('stocks.type')}</Label>
                <Select value={formData.type} onValueChange={(value: 'aliment' | 'medicament' | 'materiel') => setFormData({...formData, type: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aliment">{t('stocks.type_aliment')}</SelectItem>
                    <SelectItem value="medicament">{t('stocks.type_medicament')}</SelectItem>
                    <SelectItem value="materiel">{t('stocks.type_materiel')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantite">{t('stocks.quantity')} *</Label>
                  <Input
                    id="quantite"
                    type="number"
                    value={formData.quantite}
                    onChange={(e) => setFormData({...formData, quantite: parseFloat(e.target.value) || 0})}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="unite">{t('stocks.unit')} *</Label>
                  <Input
                    id="unite"
                    value={formData.unite}
                    onChange={(e) => setFormData({...formData, unite: e.target.value})}
                    placeholder="kg, L, pcs..."
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="seuil_alerte">{t('stocks.alertThreshold')}</Label>
                <Input
                  id="seuil_alerte"
                  type="number"
                  value={formData.seuil_alerte}
                  onChange={(e) => setFormData({...formData, seuil_alerte: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="prix_unitaire">{t('stocks.unitPrice')} (FCFA)</Label>
                <Input
                  id="prix_unitaire"
                  type="number"
                  value={formData.prix_unitaire}
                  onChange={(e) => setFormData({...formData, prix_unitaire: parseFloat(e.target.value) || 0})}
                />
              </div>

              <div>
                <Label htmlFor="fournisseur">{t('stocks.supplier')}</Label>
                <Input
                  id="fournisseur"
                  value={formData.fournisseur}
                  onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
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

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes stock bas ({lowStockItems.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lowStockItems.map((stock) => (
                <div key={stock.id} className="bg-white p-4 rounded-lg border border-red-200">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium">{stock.nom}</h4>
                    <Badge className={getTypeColor(stock.type)}>
                      {t(`stocks.type_${stock.type}`)}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div>Stock: {stock.quantite} {stock.unite}</div>
                    <div>Seuil: {stock.seuil_alerte} {stock.unite}</div>
                    <div className="text-red-600 font-medium">Réapprovisionner!</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Regular Stock Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {regularStockItems.map((stock) => (
          <Card key={stock.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{stock.nom}</CardTitle>
                  <p className="text-sm text-gray-600">{stock.fournisseur}</p>
                </div>
                <Badge className={getTypeColor(stock.type)}>
                  {t(`stocks.type_${stock.type}`)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Stock:</span>
                  <div className="flex items-center">
                    <Package className="h-3 w-3 mr-1" />
                    {stock.quantite} {stock.unite}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Seuil alerte:</span>
                  <div>{stock.seuil_alerte} {stock.unite}</div>
                </div>
                
                <div>
                  <span className="font-medium">Prix unitaire:</span>
                  <div>{stock.prix_unitaire} FCFA</div>
                </div>
                
                <div>
                  <span className="font-medium">Valeur totale:</span>
                  <div>{(stock.quantite * stock.prix_unitaire).toLocaleString()} FCFA</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    Modifier
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Utiliser
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stocks.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Aucun stock enregistré</p>
            <p className="text-sm text-gray-400 mt-1">Ajoutez vos premiers articles en stock</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockManager;
