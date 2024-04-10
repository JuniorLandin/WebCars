import { onAuthStateChanged } from "firebase/auth";
import { ReactNode, createContext, useState, useEffect } from "react";
import { auth } from "../services/firebaseConnection";

interface AuthProviderProps {
  children: ReactNode;
}

type AuthContextData = {
  signed: boolean;
  loadingAuth: boolean;
  handleInfoUser: ({name, email, uid}: UserProps) => void,
  user: UserProps | null
}

interface UserProps{
  uid: string;
  name: string | null;
  email: string | null;
}

export const AuthContext = createContext({} as AuthContextData)

function AuthProvider({children}: AuthProviderProps){

  const [user, setUser] = useState<UserProps | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {

    const unsub = onAuthStateChanged(auth, (user) => {
      if(user){
        //User logado
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email
        })

        setLoadingAuth(false)

      } else {
        //Não tem user logado!
        setUser(null);
        setLoadingAuth(false)
      }
    })

    return () => {
      unsub
    }

  }, [])

  function handleInfoUser({uid, name, email}: UserProps){
    setUser({
      name,
      email,
      uid
    })
  }

  return(
    <AuthContext.Provider
     value={{
      signed: !!user,
      loadingAuth,
      handleInfoUser,
      user
    }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider