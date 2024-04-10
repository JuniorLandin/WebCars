import { FiLogIn, FiUser } from 'react-icons/fi'
import Logo from '../../assets/logo.svg'
import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../../contents/AuthContext';

export function Header() {

  const {signed, loadingAuth} = useContext(AuthContext);

  return (
    <div className='flex items-center justify-center w-full h-16 bg-zinc-800 drop-shadow mb-4'>

      <header className='flex items-center justify-between w-full max-w-7xl px-4 mx-auto'>
        <Link to={"/"}>
          <img alt='Logo do Site' src={Logo} className='w-36'/>
        </Link>

        {!loadingAuth && signed && (
          <Link to={"/dashboard"}>
            <div className='border-2 rounded-full p-1 border-white'>
              <FiUser size={24} color='#fff'/>
            </div>
          </Link>
        )}

        {!loadingAuth && !signed && (
          <Link to={"/login"}>
             <div className='border-2 rounded-full p-1 border-white'>
              <FiLogIn size={24} color='#fff'/>
             </div>
          </Link>
        )}
      </header>
    </div>
  )
}