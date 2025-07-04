
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Database, TrendingUp, AlertTriangle, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Dashboard from '@/components/Dashboard';
import RabbitManager from '@/components/RabbitManager';
import StockManager from '@/components/StockManager';
import FinanceManager from '@/components/FinanceManager';
import ReportGenerator from '@/components/ReportGenerator';
import { DatabaseService } from '@/utils/database';
import { useTranslation } from '@/hooks/useTranslation';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dbInitialized, setDbInitialized] = useState(false);
  const { toast } = useToast();
  const { t, language, setLanguage } = useTranslation();

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    try {
      await DatabaseService.initialize();
      setDbInitialized(true);
      toast({
        title: t('common.success'),
        description: t('database.initialized'),
      });
    } catch (error) {
      console.error('Database initialization failed:', error);
      toast({
        title: t('common.error'),
        description: t('database.error'),
        variant: 'destructive',
      });
    }
  };

  if (!dbInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center p-8">
            <Database className="h-16 w-16 text-green-600 mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold mb-2">{t('app.initializing')}</h2>
            <p className="text-gray-600 text-center">{t('app.loading')}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-green-600 p-2 rounded-lg">
                <Database className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">CuniGestion</h1>
                <p className="text-sm text-gray-600">{t('app.subtitle')}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
              >
                {language === 'fr' ? '🇬🇧 EN' : '🇫🇷 FR'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.dashboard')}</span>
            </TabsTrigger>
            <TabsTrigger value="rabbits" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.rabbits')}</span>
            </TabsTrigger>
            <TabsTrigger value="stocks" className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.stocks')}</span>
            </TabsTrigger>
            <TabsTrigger value="finances" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.finances')}</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">{t('nav.reports')}</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <Dashboard />
          </TabsContent>

          <TabsContent value="rabbits">
            <RabbitManager />
          </TabsContent>

          <TabsContent value="stocks">
            <StockManager />
          </TabsContent>

          <TabsContent value="finances">
            <FinanceManager />
          </TabsContent>

          <TabsContent value="reports">
            <ReportGenerator />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
