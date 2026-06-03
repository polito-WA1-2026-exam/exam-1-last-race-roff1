import { Stack } from 'react-bootstrap';

function NavigationRail(props) {
    return (
        <Stack gap={3}>
            <div>
                <i class="bi bi-train-freight-front-fill"></i>
            </div>
            <div>
                <i class="bi bi-book-half"></i>
            </div>
            <div>
                <i class="bi bi-trophy-fill"></i>
            </div>
        </Stack>
    )
}

export { NavigationRail }