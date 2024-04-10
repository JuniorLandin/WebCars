import { ReactNode, useContext } from "react"
import { AuthContext } from "../contents/AuthContext"
import { Navigate } from "react-router-dom";

interface PrivateProps{
  children: ReactNode
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function Private({children}: PrivateProps): any{

  const {signed, loadingAuth} = useContext(AuthContext);

  if(loadingAuth){
    return <div>Loading...</div>
  }

  if(!signed){
    return <Navigate to={"/login"}/>
  }
  
  return children
}