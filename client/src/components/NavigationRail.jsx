import UserContext from "../contexts/UserContext.js"

import { useContext } from 'react';
import { Link } from 'react-router'

import { Stack } from 'react-bootstrap';

function NavigationRail(props) {
    const user = useContext(UserContext)

    return (
        <Stack gap={1} className='nav-rail p-2'>
            <div>
                <Link title='Home' to='/'>
                    <i class="bi bi-house-door-fill"></i>
                </Link>
            </div>
            <div>
                <Link title='Instructions' to='/instructions'>
                    <i class="bi bi-book-half"></i>
                </Link>
            </div>

            { user?.id && (
                <>
                    <div>
                        <Link title='Ranking' to='/ranking'>
                            <i class="bi bi-trophy-fill"></i>
                        </Link>
                    </div>
                    <div>
                        <Link title='New game' to='/game'>
                            <i class="bi bi-train-freight-front-fill"></i>
                        </Link>
                    </div>
                    <div>
                        <Link title='Logout' to='/logout'>
                            <i class="bi bi-door-closed-fill"></i>
                        </Link>
                    </div>                
                </>
            ) }

        </Stack>
    )
}

export { NavigationRail }