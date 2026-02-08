import { useState, useMemo } from 'react'
import { Card, Button, Input, Tag, Badge, Skeleton } from '@/components/ui'
import {
    HiOutlinePlus,
    HiOutlineSearch,
    HiOutlineTicket,
    HiOutlineClock,
    HiOutlineCheckCircle,
} from 'react-icons/hi'
import classNames from '@/utils/classNames'
import Table from '@/components/ui/Table'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { apiGetSupportTickets } from '@/services/SupportService'
import { SupportTicket, TicketStatus } from '@/@types/support'

const { Tr, Th, Td, THead, TBody } = Table

type FilterType = 'all' | 'open' | 'in_progress' | 'waiting_for_user' | 'closed'

const Support = () => {
    const navigate = useNavigate()
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const { data: response, isLoading } = useSWR(
        '/api/support-tickets',
        () => apiGetSupportTickets(),
        {
            revalidateOnFocus: false,
        }
    )

    const tickets = useMemo(() => response?.data || [], [response])

    const getPriorityTag = (priority: SupportTicket['priority']) => {
        switch (priority) {
            case 'high':
                return <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">فوری</Tag>
            case 'medium':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">متوسط</Tag>
            case 'low':
                return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">کم</Tag>
            default:
                return <Tag>{priority}</Tag>
        }
    }

    const getStatusTag = (status: SupportTicket['status']) => {
        switch (status) {
            case 'open':
                return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">باز</Tag>
            case 'in_progress':
                return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">در حال بررسی</Tag>
            case 'waiting_for_user':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">در انتظار پاسخ کاربر</Tag>
            case 'closed':
                return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-0">بسته شده</Tag>
            default:
                return <Tag>{status}</Tag>
        }
    }

    const filteredTickets = useMemo(() => {
        if (!tickets) return []

        return tickets.filter(ticket => {
            const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter
            const matchesSearch =
                ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (ticket.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
            return matchesFilter && matchesSearch
        })
    }, [tickets, selectedFilter, searchQuery])

    const openCount = useMemo(() => tickets.filter(t => t.status === 'open').length, [tickets])
    const inProgressCount = useMemo(() => tickets.filter(t => t.status === 'in_progress').length, [tickets])
    const waitingForUserCount = useMemo(() => tickets.filter(t => t.status === 'waiting_for_user').length, [tickets])
    const closedCount = useMemo(() => tickets.filter(t => t.status === 'closed').length, [tickets])

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <HiOutlineTicket className="text-3xl" />
                        تیکت‌های پشتیبانی
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        مشاهده و مدیریت تیکت‌های پشتیبانی
                    </p>
                </div>
                <Button
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => navigate('/admin/support/create')}
                >
                    ایجاد تیکت جدید
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'all' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('all')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">همه</p>
                            {isLoading ? (
                                <Skeleton width={40} height={32} className="mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tickets.length}</h3>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineTicket className="text-xl text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'open' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('open')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">باز</p>
                            {isLoading ? (
                                <Skeleton width={40} height={32} className="mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{openCount}</h3>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Badge innerClass="bg-green-500" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'in_progress' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('in_progress')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">در حال بررسی</p>
                            {isLoading ? (
                                <Skeleton width={40} height={32} className="mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{inProgressCount}</h3>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineClock className="text-xl text-blue-600 dark:text-blue-400" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'waiting_for_user' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('waiting_for_user')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">در انتظار کاربر</p>
                            {isLoading ? (
                                <Skeleton width={40} height={32} className="mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{waitingForUserCount}</h3>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineClock className="text-xl text-amber-600 dark:text-amber-400" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'closed' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('closed')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">بسته شده</p>
                            {isLoading ? (
                                <Skeleton width={40} height={32} className="mt-1" />
                            ) : (
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{closedCount}</h3>
                            )}
                        </div>
                        <div className="w-10 h-10 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-xl text-gray-600 dark:text-gray-400" />
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search */}
            <Card className="p-4">
                <Input
                    placeholder="جستجو در تیکت‌ها..."
                    prefix={<HiOutlineSearch />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* Tickets Table */}
            <Card>
                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        لیست تیکت‌ها
                        {!isLoading && selectedFilter !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredTickets.length} مورد)
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>شماره تیکت</Th>
                                    <Th>کاربر</Th>
                                    <Th>موضوع</Th>
                                    <Th>دسته‌بندی</Th>
                                    <Th>اولویت</Th>
                                    <Th>وضعیت</Th>
                                    <Th>تاریخ ایجاد</Th>
                                    <Th>آخرین بروزرسانی</Th>
                                    <Th>عملیات</Th>
                                </Tr>
                            </THead>
                            <TBody>
                                {isLoading ? (
                                    Array(5).fill(0).map((_, index) => (
                                        <Tr key={index}>
                                            <Td><Skeleton width={80} /></Td>
                                            <Td><Skeleton width={120} /></Td>
                                            <Td><Skeleton width={150} /></Td>
                                            <Td><Skeleton width={80} /></Td>
                                            <Td><Skeleton width={60} /></Td>
                                            <Td><Skeleton width={60} /></Td>
                                            <Td><Skeleton width={100} /></Td>
                                            <Td><Skeleton width={100} /></Td>
                                            <Td><Skeleton width={80} /></Td>
                                        </Tr>
                                    ))
                                ) : filteredTickets.length > 0 ? (
                                    filteredTickets.map((ticket) => (
                                        <Tr key={ticket.id}>
                                            <Td>
                                                <span className="font-mono font-semibold text-primary">
                                                    {ticket.ticket_number}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="font-semibold text-gray-900 dark:text-gray-200">
                                                    {ticket.user?.name || 'ناشناس'}
                                                </span>
                                            </Td>
                                            <Td>
                                                <span className="font-semibold text-gray-900 dark:text-white">
                                                    {ticket.subject}
                                                </span>
                                            </Td>
                                            <Td>
                                                <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">
                                                    {ticket.category}
                                                </Tag>
                                            </Td>
                                            <Td>{getPriorityTag(ticket.priority)}</Td>
                                            <Td>{getStatusTag(ticket.status)}</Td>
                                            <Td>{formatDate(ticket.created_at)}</Td>
                                            <Td>{formatDate(ticket.updated_at)}</Td>
                                            <Td>
                                                <Button
                                                    size="sm"
                                                    variant="solid"
                                                    onClick={() => navigate(`/admin/support/ticket/${ticket.id}`)}
                                                >
                                                    مشاهده
                                                </Button>
                                            </Td>
                                        </Tr>
                                    ))
                                ) : (
                                    <Tr>
                                        <Td colSpan={8}>
                                            <div className="text-center py-12">
                                                <HiOutlineTicket className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                                <p className="text-gray-500 dark:text-gray-400">
                                                    تیکتی یافت نشد
                                                </p>
                                            </div>
                                        </Td>
                                    </Tr>
                                )}
                            </TBody>
                        </Table>
                    </div>
                </div>
            </Card>
        </div>
    )
}

export default Support
