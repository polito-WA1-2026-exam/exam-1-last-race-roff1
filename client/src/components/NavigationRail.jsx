import { useContext } from 'react';
import { Link } from 'react-router'
import { Stack, Button } from 'react-bootstrap';
import UserContext from "../contexts/UserContext.js"

function NavigationRail(props) {
    const user = useContext(UserContext)

    return (
        <Stack gap={1} className='nav-rail p-2'>
            <div>
                <Link title='Home' to='/'>
                    <i className="bi bi-house-door-fill"></i>
                </Link>
            </div>
            <div>
                <Link title='Instructions' to='/instructions'>
                    <i className="bi bi-book-half"></i>
                </Link>
            </div>

            { user?.id && (
                <>
                    <div>
                        <Link title='Ranking' to='/ranking'>
                            <i className="bi bi-trophy-fill"></i>
                        </Link>
                    </div>
                    <div>
                        <Link title='New game' to='/game'>
                            <i className="bi bi-train-freight-front-fill"></i>
                        </Link>
                    </div>
                    <div>
                        <Button onClick={props.onLogout} title='Logout'>
                            <span className="material-symbols-outlined">logout</span>
                        </Button>
                    </div>                
                </>
            ) }

        </Stack>
    )
}

export { NavigationRail }