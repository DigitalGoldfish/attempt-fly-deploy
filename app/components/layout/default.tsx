import { Link, Outlet } from '@remix-run/react'
import logo from '#app/assets/logo-publicare.png'
import React from 'react'
import { UserDropdown } from '#app/root.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { List } from 'lucide-react'

export function DefaultLayout({
	children,
	aside,
	menuLinks,
	pageTitle = '',
	wide = false,
}: {
	children: React.ReactNode
	aside?: React.ReactNode
	menuLinks?: React.ReactNode
	pageTitle?: string
	wide?: boolean
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
				<div className="flex h-12 justify-between bg-pcteal-default">
					<div className="container flex h-full items-center justify-between">
						<div className="text-h3 font-normal text-white">{pageTitle}</div>
						<div>{menuLinks}</div>
					</div>
				</div>
				<main
					className="font-poppins container mx-auto my-8 h-full place-items-start"
					style={{
						minHeight: 'calc(100vh - 120px - 4rem)',
						minWidth: wide ? 1800 : undefined,
					}}
				>
					{children}
				</main>
			</div>
		</div>
	)
}
