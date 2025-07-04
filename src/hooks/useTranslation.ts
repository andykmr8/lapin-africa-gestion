
import { useState, useEffect } from 'react';

interface Translations {
  [key: string]: any;
}

const translations: { [lang: string]: Translations } = {
  fr: {
    common: {
      save: 'Enregistrer',
      cancel: 'Annuler',
      delete: 'Supprimer',
      edit: 'Modifier',
      add: 'Ajouter',
      success: 'Succès',
      error: 'Erreur',
      loading: 'Chargement...'
    },
    app: {
      title: 'CuniGestion',
      subtitle: 'Gestion d\'élevage de lapins',
      initializing: 'Initialisation...',
      loading: 'Chargement de la base de données...'
    },
    nav: {
      dashboard: 'Tableau de bord',
      rabbits: 'Lapins',
      stocks: 'Stocks',
      finances: 'Finances',
      reports: 'Rapports'
    },
    database: {
      initialized: 'Base de données initialisée',
      error: 'Erreur d\'initialisation de la base de données'
    },
    dashboard: {
      title: 'Tableau de bord',
      totalRabbits: 'Total lapins',
      readyForSale: 'Prêts vente',
      breeders: 'Reproducteurs',
      monthlyRevenue: 'Revenus mois',
      monthlyExpenses: 'Dépenses mois',
      monthlyProfit: 'Bénéfice mois',
      lowStock: 'Stocks bas',
      quickActions: 'Actions rapides',
      addRabbit: 'Nouveau lapin',
      recordSale: 'Enregistrer vente',
      alerts: 'Alertes'
    },
    rabbits: {
      title: 'Gestion des lapins',
      add: 'Ajouter un lapin',
      name: 'Nom',
      sex: 'Sexe',
      male: 'Mâle',
      female: 'Femelle',
      race: 'Race',
      birthDate: 'Date de naissance',
      currentWeight: 'Poids actuel',
      status: 'Statut',
      mother: 'Mère',
      father: 'Père',
      age: 'Âge',
      days: 'jours',
      kg: 'kg',
      status_jeune: 'Jeune',
      status_sevre: 'Sevré',
      status_pret_vente: 'Prêt vente',
      status_reproducteur: 'Reproducteur',
      status_malade: 'Malade',
      status_vendu: 'Vendu'
    },
    stocks: {
      title: 'Gestion des stocks',
      add: 'Ajouter stock',
      name: 'Nom',
      type: 'Type',
      quantity: 'Quantité',
      unit: 'Unité',
      alertThreshold: 'Seuil alerte',
      unitPrice: 'Prix unitaire',
      supplier: 'Fournisseur',
      type_aliment: 'Aliment',
      type_medicament: 'Médicament',
      type_materiel: 'Matériel'
    },
    finances: {
      title: 'Gestion financière',
      add: 'Nouvelle transaction',
      type: 'Type',
      amount: 'Montant',
      description: 'Description',
      date: 'Date',
      category: 'Catégorie',
      type_vente: 'Vente',
      type_achat: 'Achat'
    },
    reports: {
      title: 'Rapports et analyses',
      generate: 'Générer rapport',
      period: 'Période',
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois',
      thisYear: 'Cette année'
    }
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      add: 'Add',
      success: 'Success',
      error: 'Error',
      loading: 'Loading...'
    },
    app: {
      title: 'CuniGestion',
      subtitle: 'Rabbit farming management',
      initializing: 'Initializing...',
      loading: 'Loading database...'
    },
    nav: {
      dashboard: 'Dashboard',
      rabbits: 'Rabbits',
      stocks: 'Stocks',
      finances: 'Finances',
      reports: 'Reports'
    },
    database: {
      initialized: 'Database initialized',
      error: 'Database initialization error'
    },
    dashboard: {
      title: 'Dashboard',
      totalRabbits: 'Total rabbits',
      readyForSale: 'Ready for sale',
      breeders: 'Breeders',
      monthlyRevenue: 'Monthly revenue',
      monthlyExpenses: 'Monthly expenses',
      monthlyProfit: 'Monthly profit',
      lowStock: 'Low stock',
      quickActions: 'Quick actions',
      addRabbit: 'New rabbit',
      recordSale: 'Record sale',
      alerts: 'Alerts'
    },
    rabbits: {
      title: 'Rabbit management',
      add: 'Add rabbit',
      name: 'Name',
      sex: 'Sex',
      male: 'Male',
      female: 'Female',
      race: 'Breed',
      birthDate: 'Birth date',
      currentWeight: 'Current weight',
      status: 'Status',
      mother: 'Mother',
      father: 'Father',
      age: 'Age',
      days: 'days',
      kg: 'kg',
      status_jeune: 'Young',
      status_sevre: 'Weaned',
      status_pret_vente: 'Ready for sale',
      status_reproducteur: 'Breeder',
      status_malade: 'Sick',
      status_vendu: 'Sold'
    },
    stocks: {
      title: 'Stock management',
      add: 'Add stock',
      name: 'Name',
      type: 'Type',
      quantity: 'Quantity',
      unit: 'Unit',
      alertThreshold: 'Alert threshold',
      unitPrice: 'Unit price',
      supplier: 'Supplier',
      type_aliment: 'Feed',
      type_medicament: 'Medicine',
      type_materiel: 'Equipment'
    },
    finances: {
      title: 'Financial management',
      add: 'New transaction',
      type: 'Type',
      amount: 'Amount',
      description: 'Description',
      date: 'Date',
      category: 'Category',
      type_vente: 'Sale',
      type_achat: 'Purchase'
    },
    reports: {
      title: 'Reports and analytics',
      generate: 'Generate report',
      period: 'Period',
      thisWeek: 'This week',
      thisMonth: 'This month',
      thisYear: 'This year'
    }
  }
};

export const useTranslation = () => {
  const [language, setLanguage] = useState<'fr' | 'en'>('fr');

  useEffect(() => {
    const savedLang = localStorage.getItem('language') as 'fr' | 'en';
    if (savedLang) {
      setLanguage(savedLang);
    }
  }, []);

  const changeLanguage = (lang: 'fr' | 'en') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return {
    t,
    language,
    setLanguage: changeLanguage
  };
};
