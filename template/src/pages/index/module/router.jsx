import React from 'react'
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

const routes = [
    { path: '/',
        exact: true,
        sidebar: () => <div>home!</div>,
        main: () => <h2>Home</h2>
    },
    { path: '/hbuild',
        sidebar: () => <div>hbuild demo for react+react-router!</div>,
        main: () => <h2>hbuild</h2>
    },
    { path: '/demo',
        sidebar: () => <div>demo!</div>,
        main: () => <h2>demo</h2>
    }
]

const HbuildRouterExample = () => (
    <Router>
        <div style=\{{ display: 'flex' }}>
            <div style=\{{
                padding: '10px',
                width: '40%',
                background: '#f0f0f0'
            }}>
                <ul style=\{{ listStyleType: 'none', padding: 0 }}>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/hbuild">hbuild</Link></li>
                    <li><Link to="/demo">demo</Link></li>
                </ul>

                {routes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        exact={route.exact}
                        component={route.sidebar}
                    />
                ))}
            </div>

            <div style=\{{ flex: 1, padding: '10px' }}>
                {routes.map((route, index) => (
                    <Route
                        key={index}
                        path={route.path}
                        exact={route.exact}
                        component={route.main}
                    />
                ))}
            </div>
        </div>
    </Router>
)

export default HbuildRouterExample
