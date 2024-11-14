import { type Prisma } from '.prisma/client'
import { prisma } from '#app/utils/db.server.ts'

export async function nextIncoming(where: Prisma.IncomingWhereInput) {
	return await prisma.incoming.findFirst({
		where,
		orderBy: {
			createdAt: 'asc',
		},
		include: {
			mail: {
				include: {
					attachments: {
						select: {
							id: true,
							fileName: true,
							contentType: true,
							size: true,
							previewImages: true,
							width: true,
							height: true,
						},
					},
				},
			},
			tags: true,
			formSubmission: true,
			documents: {
				select: {
					id: true,
					fileName: true,
					contentType: true,
					size: true,
					previewImages: true,
					width: true,
					height: true,
				},
			},
		},
		skip: 0,
	})
}
