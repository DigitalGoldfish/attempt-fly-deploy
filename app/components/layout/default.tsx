import { Link, Outlet } from '@remix-run/react'
import logo from '#app/assets/logo-publicare.png'
import React from 'react'

export function DefaultLayout({
	children,
	pageTitle = '',
}: {
	children: React.ReactNode
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
						<span>Item 1</span>
						<span>Item 2</span>
					</div>
				</div>
			</header>
			<div className="flex-grow">{<Outlet />}</div>
			<div className="flex flex-col">
				<div className="h-12 bg-[#009aa4]">
					{pageTitle && (
						<div className="container flex h-full items-center text-h3 font-bold text-white">
							{pageTitle}
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
