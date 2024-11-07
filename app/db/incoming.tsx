import { prisma } from '#app/utils/db.server.ts'
import { Prisma } from '.prisma/client'

export async function nextIncoming(where: Prisma.IncomingWhereInput) {
	return await prisma.incoming.findFirst({
		where,
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
				},
			},
		},
		skip: 0,
	})
}
