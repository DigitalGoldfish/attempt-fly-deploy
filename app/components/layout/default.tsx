import { Link, Outlet } from '@remix-run/react'
import logo from '#app/assets/logo-publicare.png'
import React from 'react'
import { UserDropdown } from '#app/root.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'

export function DefaultLayout({
	children,
	aside,
	pageTitle = '',
}: {
	children: React.ReactNode
	aside?: React.ReactNode
	pageTitle?: string
}) {
	return (
		<div className="flex flex-col">
			<header>
				<div className="container flex justify-between">
					<h1 className="py-4">
						<Link to="/">
							<img src={logo} alt="Publicare Logo" style={{ height: 40 }} />
						</Link>
					</h1>
					<div className="flex items-center gap-8">
						{aside}
						<UserDropdown />
					</div>
				</div>
			</header>
			<div className="flex-grow">{<Outlet />}</div>
			<div className="flex flex-col">
				<div className="bg-pcteal-default flex h-12 justify-between">
					{pageTitle && (
						<div className="container flex h-full items-center justify-between">
							<div className="text-h3 font-normal text-white">{pageTitle}</div>
							<div>
								<Button
									variant="link"
									className="flex gap-4 text-white"
									asChild
								>
									<Link to="/liste" className="flex gap-4 text-body-sm">
										<List />
										Listeansicht
									</Link>
								</Button>
							</div>
						</div>
					)}
				</div>
				<main className="font-poppins container mx-auto my-8 place-items-start">
					{children}
				</main>
			</div>
		</div>
	)
}
