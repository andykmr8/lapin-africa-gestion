
interface Rabbit {
  id?: number;
  nom: string;
  sexe: 'male' | 'femelle';
  race: string;
  date_naissance: string;
  poids_actuel: number;
  statut: 'jeune' | 'sevre' | 'pret_vente' | 'reproducteur' | 'malade' | 'vendu';
  mere_id?: number;
  pere_id?: number;
  created_at?: string;
}

interface Stock {
  id?: number;
  nom: string;
  type: 'aliment' | 'medicament' | 'materiel';
  quantite: number;
  unite: string;
  seuil_alerte: number;
  prix_unitaire: number;
  fournisseur: string;
  created_at?: string;
}

interface Finance {
  id?: number;
  type: 'vente' | 'achat';
  montant: number;
  description: string;
  date: string;
  categorie: string;
  created_at?: string;
}

interface Reproduction {
  id?: number;
  mere_id: number;
  pere_id: number;
  date_accouplement: string;
  date_mise_bas_prevue: string;
  date_mise_bas_reelle?: string;
  nb_lapereaux?: number;
  created_at?: string;
}

interface Sante {
  id?: number;
  lapin_id: number;
  type: 'maladie' | 'vaccin' | 'traitement';
  description: string;
  date_debut: string;
  date_fin?: string;
  medicament?: string;
  created_at?: string;
}

class DatabaseService {
  private static db: any = null;

  static async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Utilisation du localStorage pour simuler SQLite
      try {
        this.initializeLocalStorage();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static initializeLocalStorage(): void {
    const tables = ['rabbits', 'stocks', 'finances', 'reproductions', 'sante'];
    
    tables.forEach(table => {
      if (!localStorage.getItem(table)) {
        localStorage.setItem(table, JSON.stringify([]));
      }
    });
  }

  // Méthodes pour les lapins
  static async getRabbits(): Promise<Rabbit[]> {
    const data = localStorage.getItem('rabbits');
    return data ? JSON.parse(data) : [];
  }

  static async addRabbit(rabbit: Omit<Rabbit, 'id' | 'created_at'>): Promise<number> {
    const rabbits = await this.getRabbits();
    const newRabbit: Rabbit = {
      ...rabbit,
      id: Date.now(),
      created_at: new Date().toISOString(),
      statut: this.calculateRabbitStatus(rabbit)
    };
    
    rabbits.push(newRabbit);
    localStorage.setItem('rabbits', JSON.stringify(rabbits));
    return newRabbit.id!;
  }

  static async updateRabbit(id: number, updates: Partial<Rabbit>): Promise<void> {
    const rabbits = await this.getRabbits();
    const index = rabbits.findIndex(r => r.id === id);
    
    if (index !== -1) {
      rabbits[index] = { 
        ...rabbits[index], 
        ...updates,
        statut: this.calculateRabbitStatus({ ...rabbits[index], ...updates })
      };
      localStorage.setItem('rabbits', JSON.stringify(rabbits));
    }
  }

  static calculateRabbitStatus(rabbit: Partial<Rabbit>): Rabbit['statut'] {
    if (!rabbit.date_naissance) return 'jeune';
    
    const age = this.calculateAge(rabbit.date_naissance);
    const poids = rabbit.poids_actuel || 0;
    
    if (rabbit.statut === 'malade' || rabbit.statut === 'vendu') {
      return rabbit.statut;
    }
    
    if (age >= 40 && age < 60) return 'sevre';
    if (poids >= 2.5 && age >= 60 && age < 120) return 'pret_vente';
    if (age >= 120) return 'reproducteur';
    
    return 'jeune';
  }

  static calculateAge(dateNaissance: string): number {
    const birth = new Date(dateNaissance);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - birth.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  // Méthodes pour les stocks
  static async getStocks(): Promise<Stock[]> {
    const data = localStorage.getItem('stocks');
    return data ? JSON.parse(data) : [];
  }

  static async addStock(stock: Omit<Stock, 'id' | 'created_at'>): Promise<number> {
    const stocks = await this.getStocks();
    const newStock: Stock = {
      ...stock,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    stocks.push(newStock);
    localStorage.setItem('stocks', JSON.stringify(stocks));
    return newStock.id!;
  }

  static async updateStock(id: number, updates: Partial<Stock>): Promise<void> {
    const stocks = await this.getStocks();
    const index = stocks.findIndex(s => s.id === id);
    
    if (index !== -1) {
      stocks[index] = { ...stocks[index], ...updates };
      localStorage.setItem('stocks', JSON.stringify(stocks));
    }
  }

  // Méthodes pour les finances
  static async getFinances(): Promise<Finance[]> {
    const data = localStorage.getItem('finances');
    return data ? JSON.parse(data) : [];
  }

  static async addFinance(finance: Omit<Finance, 'id' | 'created_at'>): Promise<number> {
    const finances = await this.getFinances();
    const newFinance: Finance = {
      ...finance,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    finances.push(newFinance);
    localStorage.setItem('finances', JSON.stringify(finances));
    return newFinance.id!;
  }

  // Méthodes pour les reproductions
  static async getReproductions(): Promise<Reproduction[]> {
    const data = localStorage.getItem('reproductions');
    return data ? JSON.parse(data) : [];
  }

  static async addReproduction(reproduction: Omit<Reproduction, 'id' | 'created_at'>): Promise<number> {
    const reproductions = await this.getReproductions();
    const newReproduction: Reproduction = {
      ...reproduction,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    reproductions.push(newReproduction);
    localStorage.setItem('reproductions', JSON.stringify(reproductions));
    return newReproduction.id!;
  }

  // Méthodes pour la santé
  static async getSante(): Promise<Sante[]> {
    const data = localStorage.getItem('sante');
    return data ? JSON.parse(data) : [];
  }

  static async addSante(sante: Omit<Sante, 'id' | 'created_at'>): Promise<number> {
    const santeRecords = await this.getSante();
    const newSante: Sante = {
      ...sante,
      id: Date.now(),
      created_at: new Date().toISOString()
    };
    
    santeRecords.push(newSante);
    localStorage.setItem('sante', JSON.stringify(santeRecords));
    return newSante.id!;
  }

  // Méthodes utilitaires
  static async getKPIs() {
    const rabbits = await this.getRabbits();
    const finances = await this.getFinances();
    const stocks = await this.getStocks();
    
    const totalRabbits = rabbits.length;
    const readyForSale = rabbits.filter(r => r.statut === 'pret_vente').length;
    const breeders = rabbits.filter(r => r.statut === 'reproducteur').length;
    
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    
    const monthlyRevenue = finances
      .filter(f => f.type === 'vente' && 
        new Date(f.date).getMonth() === thisMonth &&
        new Date(f.date).getFullYear() === thisYear)
      .reduce((sum, f) => sum + f.montant, 0);
    
    const monthlyExpenses = finances
      .filter(f => f.type === 'achat' && 
        new Date(f.date).getMonth() === thisMonth &&
        new Date(f.date).getFullYear() === thisYear)
      .reduce((sum, f) => sum + f.montant, 0);
    
    const lowStockItems = stocks.filter(s => s.quantite <= s.seuil_alerte).length;
    
    return {
      totalRabbits,
      readyForSale,
      breeders,
      monthlyRevenue,
      monthlyExpenses,
      monthlyProfit: monthlyRevenue - monthlyExpenses,
      lowStockItems
    };
  }
}

export { DatabaseService, type Rabbit, type Stock, type Finance, type Reproduction, type Sante };
