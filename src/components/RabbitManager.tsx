
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Calendar } from 'lucide-react';
import { DatabaseService, type Rabbit } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';
import { useToast } from '@/hooks/use-toast';

const RABBIT_RACES = [
  'Néo-Zélandais Blanc',
  'Californien',
  'Fauve de Bourgogne',
  'Géant Flamand',
  'Papillon Rhénan',
  'Croisé local'
];

const RabbitManager: React.FC = () => {
  const [rabbits, setRabbits] = useState<Rabbit[]>([]);
  const [filteredRabbits, setFilteredRabbits] = useState<Rabbit[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    nom: '',
    sexe: 'femelle' as 'male' | 'femelle',
    race: '',
    date_naissance: '',
    poids_actuel: 0
  });

  useEffect(() => {
    loadRabbits();
  }, []);

  useEffect(() => {
    filterRabbits();
  }, [rabbits, searchTerm, statusFilter]);

  const loadRabbits = async () => {
    try {
      const data = await DatabaseService.getRabbits();
      setRabbits(data);
    } catch (error) {
      console.error('Error loading rabbits:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors du chargement des lapins',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRabbits = () => {
    let filtered = [...rabbits];

    if (searchTerm) {
      filtered = filtered.filter(rabbit => 
        rabbit.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rabbit.race.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(rabbit => rabbit.statut === statusFilter);
    }

    setFilteredRabbits(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.race || !formData.date_naissance) {
      toast({
        title: t('common.error'),
        description: 'Veuillez remplir tous les champs obligatoires',
        variant: 'destructive'
      });
      return;
    }

    try {
      await DatabaseService.addRabbit(formData);
      
      toast({
        title: t('common.success'),
        description: 'Lapin ajouté avec succès'
      });

      setFormData({
        nom: '',
        sexe: 'femelle',
        race: '',
        date_naissance: '',
        poids_actuel: 0
      });
      
      setShowAddForm(false);
      loadRabbits();
    } catch (error) {
      console.error('Error adding rabbit:', error);
      toast({
        title: t('common.error'),
        description: 'Erreur lors de l\'ajout du lapin',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'jeune': return 'bg-blue-100 text-blue-800';
      case 'sevre': return 'bg-yellow-100 text-yellow-800';
      case 'pret_vente': return 'bg-green-100 text-green-800';
      case 'reproducteur': return 'bg-purple-100 text-purple-800';
      case 'malade': return 'bg-red-100 text-red-800';
      case 'vendu': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
        <h2 className="text-2xl font-bold text-gray-900">{t('rabbits.title')}</h2>
        
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="h-4 w-4 mr-2" />
              {t('rabbits.add')}
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{t('rabbits.add')}</DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="nom">{t('rabbits.name')} *</Label>
                <Input
                  id="nom"
                  value={formData.nom}
                  onChange={(e) => setFormData({...formData, nom: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="sexe">{t('rabbits.sex')}</Label>
                <Select value={formData.sexe} onValueChange={(value: 'male' | 'femelle') => setFormData({...formData, sexe: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="femelle">{t('rabbits.female')}</SelectItem>
                    <SelectItem value="male">{t('rabbits.male')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="race">{t('rabbits.race')} *</Label>
                <Select value={formData.race} onValueChange={(value) => setFormData({...formData, race: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une race" />
                  </SelectTrigger>
                  <SelectContent>
                    {RABBIT_RACES.map(race => (
                      <SelectItem key={race} value={race}>{race}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date_naissance">{t('rabbits.birthDate')} *</Label>
                <Input
                  id="date_naissance"
                  type="date"
                  value={formData.date_naissance}
                  onChange={(e) => setFormData({...formData, date_naissance: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label htmlFor="poids_actuel">{t('rabbits.currentWeight')} (kg)</Label>
                <Input
                  id="poids_actuel"
                  type="number"
                  step="0.1"
                  value={formData.poids_actuel}
                  onChange={(e) => setFormData({...formData, poids_actuel: parseFloat(e.target.value) || 0})}
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

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Rechercher par nom ou race..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="jeune">Jeunes</SelectItem>
                <SelectItem value="sevre">Sevrés</SelectItem>
                <SelectItem value="pret_vente">Prêts vente</SelectItem>
                <SelectItem value="reproducteur">Reproducteurs</SelectItem>
                <SelectItem value="malade">Malades</SelectItem>
                <SelectItem value="vendu">Vendus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rabbits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRabbits.map((rabbit) => (
          <Card key={rabbit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{rabbit.nom}</CardTitle>
                  <p className="text-sm text-gray-600">{rabbit.race}</p>
                </div>
                <Badge className={getStatusColor(rabbit.statut)}>
                  {t(`rabbits.status_${rabbit.statut}`)}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Sexe:</span>
                  <div>{rabbit.sexe === 'male' ? '♂️ Mâle' : '♀️ Femelle'}</div>
                </div>
                
                <div>
                  <span className="font-medium">{t('rabbits.age')}:</span>
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 mr-1" />
                    {calculateAge(rabbit.date_naissance)} {t('rabbits.days')}
                  </div>
                </div>
                
                <div>
                  <span className="font-medium">Poids:</span>
                  <div>{rabbit.poids_actuel} {t('rabbits.kg')}</div>
                </div>
                
                <div>
                  <span className="font-medium">Né le:</span>
                  <div>{new Date(rabbit.date_naissance).toLocaleDateString('fr-FR')}</div>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <Button variant="outline" size="sm" className="w-full">
                  Voir détails
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRabbits.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Aucun lapin trouvé</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RabbitManager;
