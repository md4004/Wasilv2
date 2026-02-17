
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  collection, 
  onSnapshot, 
  setDoc,
  updateDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { AppView, ServiceRequest, Service, RequestStatus, Notification, User, Dependant, Dispatcher, Language, SubscriptionTier } from './types';
import { SERVICES, DISPATCHERS } from './constants';
import Dashboard from './components/Dashboard';
import ServiceCatalog from './components/ServiceCatalog';
import RequestFlow from './components/RequestFlow';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import LoginFlow from './components/LoginFlow';
import AccountPage from './components/AccountPage';
import DependantsPage from './components/DependantsPage';
import NotificationsPage from './components/NotificationsPage';
import PaymentMethodSelection from './components/PaymentMethodSelection';
import DispatchersPage from './components/DispatchersPage';
import AssignmentModal from './components/AssignmentModal';
import ChatModal from './components/ChatModal';
import LoadingScreen from './components/LoadingScreen';
import BottomNav from './components/BottomNav';
import RequireAuthModal from './components/RequireAuthModal';

const guestUser: User = {
  name: 'Guest Explorer',
  email: 'guest@wasil.app',
  phone: '',
  country: 'Global',
  address: 'Browsing Mode',
  photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
  plan: 'Basic' as SubscriptionTier
};

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [view, setView] = useState<AppView>('DASHBOARD');
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);
  const [openAddDepModal, setOpenAddDepModal] = useState(false);
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [dependants, setDependants] = useState<Dependant[]>([]);
  
  const scrollContainerRef = useRef<HTMLElement>(null);

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [assignedDispatcher, setAssignedDispatcher] = useState<Dispatcher | null>(null);
  const [preSelectedDepId, setPreSelectedDepId] = useState<string | null>(null);
  const [activeChatRequest, setActiveChatRequest] = useState<ServiceRequest | null>(null);
  const [showRequireAuth, setShowRequireAuth] = useState(false);

  const triggerLoading = useCallback((duration: number = 1000) => {
    setIsLoading(true);
    setIsFadingOut(false);
    setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsFadingOut(false);
      }, 500);
    }, duration);
  }, []);

  useEffect(() => {
    let unsubDeps: () => void = () => {};
    let unsubReqs: () => void = () => {};
    let unsubNotifs: () => void = () => {};

    const authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        if (!firebaseUser.emailVerified) {
          setIsLoggedIn(false);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        const uid = firebaseUser.uid;

        try {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            setCurrentUser(userDoc.data() as User);
          }

          unsubDeps = onSnapshot(collection(db, 'users', uid, 'dependants'), 
            (snapshot) => {
              setDependants(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Dependant)));
            }, 
            (err) => console.error("Permission Error (Dependants):", err)
          );

          unsubReqs = onSnapshot(collection(db, 'users', uid, 'requests'), 
            (snapshot) => {
              const reqList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as ServiceRequest));
              setRequests(reqList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            }, 
            (err) => console.error("Permission Error (Requests):", err)
          );

          unsubNotifs = onSnapshot(collection(db, 'users', uid, 'notifications'), 
            (snapshot) => {
              const notifList = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Notification));
              setNotifications(notifList.sort((a, b) => {
                const da = (a as any).timestamp?.toDate?.() || new Date(0);
                const db = (b as any).timestamp?.toDate?.() || new Date(0);
                return db.getTime() - da.getTime();
              }));
            }, 
            (err) => console.error("Permission Error (Notifications):", err)
          );

          setIsLoggedIn(true);
          setIsGuestMode(false);
        } catch (error) {
          console.error("Critical Auth Init Error:", error);
        }
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        setDependants([]);
        setRequests([]);
        setNotifications([]);
      }
      setIsLoading(false);
    });

    return () => {
      authUnsubscribe();
      unsubDeps();
      unsubReqs();
      unsubNotifs();
    };
  }, []);

  useEffect(() => {
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 0;
  }, [view]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const guardAuth = (action: () => void) => {
    if (!isLoggedIn) {
      setShowRequireAuth(true);
    } else {
      action();
    }
  };

  const handleStartRequest = (service: Service) => {
    guardAuth(() => {
      setSelectedService(service);
      setView('REQUEST_FLOW');
    });
  };

  const handleQuickRegisterDep = () => {
    guardAuth(() => {
      setOpenAddDepModal(true);
    });
  };

  const handleDeleteDependant = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await deleteDoc(doc(db, 'users', auth.currentUser.uid, 'dependants', id));
      setToast({ message: "Member removed.", type: "warning" });
    } catch (err) {
      console.error("Delete Error:", err);
    }
  };

  const handleCancelRequest = async (requestId: string, reason: string) => {
    if (!auth.currentUser) return;
    try {
      const reqRef = doc(db, 'users', auth.currentUser.uid, 'requests', requestId);
      const reqSnap = await getDoc(reqRef);
      if (reqSnap.exists()) {
        const data = reqSnap.data() as ServiceRequest;
        await updateDoc(reqRef, {
          status: RequestStatus.CANCELLED,
          cancellationReason: reason,
          expatPrice: data.expatPrice * 0.5
        });
        setToast({ message: "Cancelled. Fee applied.", type: "warning" });
      }
    } catch (err) {
      console.error("Cancel Error:", err);
    }
  };

  const handleNewRequestForDependant = (depId: string) => {
    guardAuth(() => {
      setPreSelectedDepId(depId);
      setView('CATALOG');
    });
  };

  const handleContactDispatcher = (reqId: string) => {
    guardAuth(() => {
      const req = requests.find(r => r.id === reqId);
      if (req) setActiveChatRequest(req);
    });
  };

  const handleSetView = (newView: AppView) => {
    const protectedViews: AppView[] = ['ACCOUNT', 'NOTIFICATIONS_FULL', 'PAYMENT_METHODS_ADD'];
    if (protectedViews.includes(newView) && !isLoggedIn) {
      setShowRequireAuth(true);
      return;
    }
    if (['DISPATCHERS', 'DASHBOARD', 'ACCOUNT'].includes(newView)) triggerLoading(800);
    setView(newView);
  };

  const handleCompleteRequest = async (newRequest: ServiceRequest) => {
    if (!auth.currentUser) return;
    triggerLoading(1500);
    const dispatcher = DISPATCHERS[Math.floor(Math.random() * DISPATCHERS.length)];
    const uid = auth.currentUser.uid;

    try {
      const requestId = `req-${Date.now()}`;
      const enrichedRequest = { 
        ...newRequest, 
        id: requestId, 
        userId: uid, 
        assignedDispatcherId: dispatcher.id,
        timestamp: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'users', uid, 'requests', requestId), enrichedRequest);
      
      setAssignedDispatcher(dispatcher);
      setShowAssignmentModal(true);
      
      const notifId = `notif-${Date.now()}`;
      await setDoc(doc(db, 'users', uid, 'notifications', notifId), {
        id: notifId,
        title: 'Dispatched',
        message: `${newRequest.serviceTitle} for ${newRequest.parentName} assigned to ${dispatcher.name}.`,
        time: 'Just now',
        timestamp: serverTimestamp(),
        read: false
      });

      setPreSelectedDepId(null);
    } catch (error) {
      console.error("Persistence Error:", error);
      setToast({ message: "Permission Denied. Contact support.", type: "warning" });
    }
  };

  const handleMarkNotifRead = async (id: string) => {
    if (!auth.currentUser) return;
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid, 'notifications', id), { read: true });
    } catch (err) {
      console.error("Notif Read Error:", err);
    }
  };

  const handleLogout = async () => {
    triggerLoading(1000);
    try { 
      await signOut(auth); 
      setIsGuestMode(false);
      setView('DASHBOARD'); 
    } catch (e) { 
      console.error(e); 
    }
  };

  const activeDispatcherIds = requests
    .filter(r => ![RequestStatus.COMPLETED, RequestStatus.CANCELLED].includes(r.status))
    .map(r => r.assignedDispatcherId)
    .filter((id): id is string => !!id);

  const renderView = () => {
    switch (view) {
      case 'DASHBOARD': return <Dashboard requests={requests} onNewRequest={() => handleSetView('CATALOG')} onContactDispatcher={handleContactDispatcher} onCancelRequest={handleCancelRequest} />;
      case 'CATALOG': return <ServiceCatalog onSelectService={handleStartRequest} onBack={() => handleSetView('DASHBOARD')} />;
      case 'ACCOUNT': return (currentUser || isGuestMode) ? <AccountPage user={currentUser || guestUser} setUser={setCurrentUser as any} onLogout={handleLogout} onAddPayment={() => handleSetView('PAYMENT_METHODS_ADD')} language={language} setLanguage={setLanguage} /> : null;
      case 'DEPENDANTS': return <DependantsPage dependants={dependants} setDependants={setDependants} initialOpenForm={openAddDepModal} setInitialOpenForm={setOpenAddDepModal} onNewRequestForDependant={handleNewRequestForDependant} onDeleteDependant={handleDeleteDependant} onAddClick={handleQuickRegisterDep} />;
      case 'NOTIFICATIONS_FULL': return <NotificationsPage notifications={notifications} onMarkRead={handleMarkNotifRead} onBack={() => handleSetView('DASHBOARD')} />;
      case 'PAYMENT_METHODS_ADD': return <PaymentMethodSelection onBack={() => handleSetView('ACCOUNT')} onConfirm={() => { setToast({ message: "Payment added.", type: "success" }); handleSetView('ACCOUNT'); }} />;
      case 'DISPATCHERS': return <DispatchersPage onContactDispatcher={handleContactDispatcher} activeDispatcherIds={activeDispatcherIds} />;
      case 'REQUEST_FLOW': return selectedService ? <RequestFlow service={selectedService} dependants={dependants} onCancel={() => handleSetView('CATALOG')} onComplete={handleCompleteRequest} onQuickRegister={handleQuickRegisterDep} initialDependantId={preSelectedDepId || undefined} /> : <ServiceCatalog onSelectService={handleStartRequest} onBack={() => handleSetView('DASHBOARD')} />;
      default: return <Dashboard requests={requests} onNewRequest={() => handleSetView('CATALOG')} onContactDispatcher={handleContactDispatcher} onCancelRequest={handleCancelRequest} />;
    }
  };

  if (isLoading) return <LoadingScreen fadeOut={isFadingOut} />;

  // CRITICAL: Full-screen Login Flow when not logged in and not in guest mode
  if (!isLoggedIn && !isGuestMode) {
    return (
      <div className="h-full w-full overflow-hidden">
        <LoginFlow 
          onLogin={() => {}} 
          onBrowseGuest={() => setIsGuestMode(true)}
        />
      </div>
    );
  }

  return (
    <div className={`flex h-full w-full bg-sand overflow-hidden font-sans fixed inset-0 ${language === 'ar' ? 'font-arabic' : ''}`} dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <Sidebar currentView={view} setView={handleSetView} user={currentUser || guestUser} />
      
      <div className="flex-1 flex flex-col h-full relative overflow-hidden">
        <Header activeView={view} setView={handleSetView} notifications={notifications} onMarkRead={handleMarkNotifRead} />
        
        {toast && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[150] animate-in slide-in-from-top-10 duration-500">
            <div className={`text-sand px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 ${toast.type === 'warning' ? 'bg-orange-500' : 'bg-navy'}`}>
              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${toast.type === 'warning' ? 'bg-white text-orange-500' : 'bg-sage text-navy'}`}>{toast.type === 'warning' ? '!' : '✓'}</span>
              <span className="text-sm font-medium">{toast.message}</span>
            </div>
          </div>
        )}

        {showRequireAuth && (
          <RequireAuthModal 
            onClose={() => setShowRequireAuth(false)} 
            onSignIn={() => {
              setShowRequireAuth(false);
              setIsGuestMode(false); // Triggers full-screen login flow
            }} 
          />
        )}

        {showAssignmentModal && assignedDispatcher && <AssignmentModal dispatcher={assignedDispatcher} onClose={() => { setShowAssignmentModal(false); handleSetView('DASHBOARD'); setSelectedService(null); }} onChat={() => { setShowAssignmentModal(false); if (requests.length > 0) setActiveChatRequest(requests[0]); setSelectedService(null); }} />}
        
        {activeChatRequest && (
          <ChatModal 
            request={activeChatRequest} 
            onClose={() => setActiveChatRequest(null)} 
            currentUser={currentUser || guestUser} 
            dispatcher={DISPATCHERS.find(d => d.id === activeChatRequest.assignedDispatcherId)!} 
          />
        )}

        <main ref={scrollContainerRef} className={`h-full w-full overflow-y-auto no-scrollbar p-4 md:p-8 pt-24 pb-28 md:pb-12 max-w-7xl mx-auto relative z-0 touch-pan-y`} style={{ WebkitOverflowScrolling: 'touch' }}>
          {renderView()}
        </main>
      </div>

      <BottomNav currentView={view} setView={handleSetView} />
    </div>
  );
};

export default App;
