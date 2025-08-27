import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'admin' | 'hr' | 'manager' | 'finance' | 'sales' | 'employee';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  status: string;
  department?: string;
  designation?: string;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Role-based access control configuration
const ROLE_PERMISSIONS = {
  admin: {
    users: ['create', 'read', 'update', 'delete'],
    employees: ['create', 'read', 'update', 'delete'],
    finance: ['create', 'read', 'update', 'delete'],
    procurement: ['create', 'read', 'update', 'delete', 'approve'],
    files: ['create', 'read', 'update', 'delete'],
    reports: ['create', 'read', 'update', 'delete'],
  },
  hr: {
    users: ['create', 'read', 'update'], // Cannot delete
    employees: ['create', 'read', 'update', 'delete'],
    finance: ['read'], // Read-only for HR-related expenses
    procurement: ['create', 'read', 'update', 'approve'], // HR procurement
    files: ['create', 'read', 'update'],
    reports: ['create', 'read'],
  },
  manager: {
    users: ['read'], // Basic directory access
    employees: ['read', 'update'], // Team members only
    finance: ['read', 'update'], // Department budget
    procurement: ['create', 'read', 'update'], // Department requests
    files: ['create', 'read', 'update'],
    reports: ['create', 'read'],
  },
  finance: {
    users: ['read'],
    employees: ['read'], // For payroll
    finance: ['create', 'read', 'update', 'delete'],
    procurement: ['read', 'approve'], // Financial approval
    files: ['create', 'read', 'update'],
    reports: ['create', 'read'],
  },
  sales: {
    users: ['read'],
    employees: ['read'], // Sales team only
    finance: ['read'], // Commission and sales revenue
    procurement: ['create', 'read'],
    files: ['create', 'read', 'update'],
    reports: ['create', 'read'],
  },
  employee: {
    employees: ['read'], // Own profile only
    finance: ['read'], // Own records only
    procurement: ['create', 'read'], // Basic requests
    files: ['create', 'read'],
    reports: ['read'], // Own reports only
  },
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for stored authentication on mount
    const storedToken = localStorage.getItem('auth_token');
    const storedUser = localStorage.getItem('auth_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
      const response = await fetch(`${apiUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        
        setToken(data.access_token);
        setUser(data.user);
        
        // Store in localStorage
        localStorage.setItem('auth_token', data.access_token);
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        
        return true;
      } else {
        const errorData = await response.json();
        console.error('Login failed:', errorData.message);
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  };

  const hasRole = (roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const canAccess = (resource: string, action: string): boolean => {
    if (!user) return false;
    
    const permissions = ROLE_PERMISSIONS[user.role] as Record<string, string[]>;
    if (!permissions || !permissions[resource]) return false;
    
    return permissions[resource].includes(action);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    loading,
    hasRole,
    canAccess,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
