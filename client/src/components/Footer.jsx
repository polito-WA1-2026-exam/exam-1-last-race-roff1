import { Stack } from 'react-bootstrap';

function Footer(props) {
    return (
        <Stack direction="horizontal" className='footer p-4' gap={5}>
            <Stack>
                <h4>Project details</h4>
                <hr/>
                <p><strong>Year</strong> 2025/2026</p>
                <p><strong>Exam</strong> #1</p>
                <p><strong>Title</strong> Last Race</p>
            </Stack>
            <Stack>
                <h4>Academic info</h4>
                <hr/>
                <p><strong>University</strong> Politecnico di Torino</p>
                <p><strong>Course</strong> Web Application I</p>            
            </Stack>
            <div className='vr ms-auto'/>
            <Stack className='last'>
                <h4 className="text-uppercase">Student info</h4>
                <br/>
                <p><strong className="text-uppercase">Student ID</strong> 349557</p>
                <p><strong className="text-uppercase">Name</strong> Andrea</p>
                <p><strong className="text-uppercase">Last Name</strong> Roffinella</p>
                <p><strong className="text-uppercase">Course</strong> Data Science and Engineering</p>
            </Stack>
        </Stack>
    )
}

export { Footer}