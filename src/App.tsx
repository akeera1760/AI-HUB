import { useEffect, useState } from 'react';
import { supabase, Category, AITool } from './lib/supabase';
import { Header } from './components/Header';
import { CategoriesGrid } from './components/CategoriesGrid';
import { ToolsView } from './components/ToolsView';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { LoginModal } from './components/LoginModal';
import { ChatbotWidget } from './components/ChatbotWidget';
import { Loader2 } from 'lucide-react';

function App() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<AITool[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [pendingCategoryId, setPendingCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setSessionLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!pendingCategoryId) return;

    const transitionTimer = window.setTimeout(() => {
      setSelectedCategory(pendingCategoryId);
      setPendingCategoryId(null);
    }, 420);

    return () => {
      window.clearTimeout(transitionTimer);
    };
  }, [pendingCategoryId]);

  async function checkSession() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    } finally {
      setSessionLoading(false);
    }
  }

  async function fetchData() {
    try {
      const [categoriesResult, toolsResult] = await Promise.all([
        supabase.from('categories').select('*').order('name'),
        supabase.from('ai_tools').select('*').order('name')
      ]);

      if (categoriesResult.data) {
        setCategories(categoriesResult.data);
      }

      if (toolsResult.data) {
        setTools(toolsResult.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSelectedCategory(null);
    setPendingCategoryId(null);
    setCategories([]);
    setTools([]);
  }

  function handleSelectCategory(categoryId: string) {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    if (pendingCategoryId || selectedCategory) return;
    setPendingCategoryId(categoryId);
  }

  function handleBackToCategories() {
    setSelectedCategory(null);
    setPendingCategoryId(null);
  }

  const getSelectedCategoryData = () => {
    if (!selectedCategory) return null;
    const category = categories.find(cat => cat.id === selectedCategory);
    const categoryTools = tools.filter(tool => tool.category_id === selectedCategory);
    return { category, tools: categoryTools };
  };

  if (sessionLoading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-violet-300 animate-spin mx-auto mb-4" />
          <p className="text-violet-100 text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-transparent flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-violet-300 animate-spin mx-auto mb-4" />
          <p className="text-violet-100 text-xl">Loading AI tools...</p>
        </div>
      </div>
    );
  }

  const selectedCategoryData = getSelectedCategoryData();

  return (
    <div className="min-h-screen bg-transparent">
      <Header
        userEmail={user?.email}
        onSignOut={handleSignOut}
        onLoginClick={() => setShowLoginModal(true)}
        showHero={!selectedCategoryData?.category}
      />
      {selectedCategoryData?.category ? (
        <ToolsView
          key={selectedCategoryData.category.id}
          category={selectedCategoryData.category}
          tools={selectedCategoryData.tools}
          onBack={handleBackToCategories}
        />
      ) : (
        <>
          <CategoriesGrid
            categories={categories}
            tools={tools}
            activeCategoryId={pendingCategoryId}
            isTransitioning={Boolean(pendingCategoryId)}
            onSelectCategory={handleSelectCategory}
          />
          <Footer />
        </>
      )}
      <ChatbotWidget
        categories={categories}
        tools={tools}
        selectedCategory={selectedCategoryData?.category ?? null}
        isLoggedIn={!!user}
        onLoginRequired={() => setShowLoginModal(true)}
      />
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
}

export default App;
