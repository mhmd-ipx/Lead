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
import appConfig from '@/configs/app.config'

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
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">در انتظار پاسخ شما</Tag>
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
            const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
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
            <div id="support-header" className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
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
                    id="support-add-button"
                    variant="solid"
                    icon={<HiOutlinePlus />}
                    onClick={() => navigate('/owner/support/create')}
                    className="w-full sm:w-auto"
                >
                    ایجاد تیکت جدید
                </Button>
            </div>

            {/* Stats */}
            <div id="support-stats-cards" className="flex md:grid md:grid-cols-5 gap-4 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all min-w-[200px] shrink-0 md:min-w-0 md:shrink-1',
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
                        'p-4 cursor-pointer transition-all min-w-[200px] shrink-0 md:min-w-0 md:shrink-1',
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
                        'p-4 cursor-pointer transition-all min-w-[200px] shrink-0 md:min-w-0 md:shrink-1',
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
                        'p-4 cursor-pointer transition-all min-w-[200px] shrink-0 md:min-w-0 md:shrink-1',
                        selectedFilter === 'waiting_for_user' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('waiting_for_user')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">پاسخ شما</p>
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
                        'p-4 cursor-pointer transition-all min-w-[200px] shrink-0 md:min-w-0 md:shrink-1',
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
            <Card id="support-search-filter" className="p-4">
                <Input
                    placeholder="جستجو در تیکت‌ها..."
                    prefix={<HiOutlineSearch />}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </Card>

            {/* Tickets Table */}
            <Card id="support-table" className="p-0">
                <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-0">
                        لیست تیکت‌ها
                        {!isLoading && selectedFilter !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredTickets.length} مورد)
                            </span>
                        )}
                    </h2>
                </div>
                <div className="overflow-x-auto hidden lg:block">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>شماره تیکت</Th>
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
                                                    onClick={() => navigate(`/owner/support/ticket/${ticket.id}`)}
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

                {/* Mobile List View */}
                <div className="lg:hidden flex flex-col divide-y divide-gray-100 dark:divide-gray-800">
                    {isLoading ? (
                        Array(3).fill(0).map((_, index) => (
                            <div key={index} className="p-4 space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton width={120} height={20} />
                                    <Skeleton width={60} height={20} />
                                </div>
                                <Skeleton width="100%" height={16} />
                                <div className="flex justify-between">
                                    <Skeleton width={80} height={16} />
                                    <Skeleton width={80} height={16} />
                                </div>
                            </div>
                        ))
                    ) : filteredTickets.length > 0 ? (
                        filteredTickets.map((ticket) => (
                            <div key={ticket.id} className="p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="pr-2">
                                        <div className="font-semibold text-gray-900 dark:text-white text-sm mb-1 line-clamp-1">
                                            {ticket.subject}
                                        </div>
                                        <div className="font-mono text-xs text-primary mb-1">
                                            #{ticket.ticket_number}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2 shrink-0">
                                        <div className="w-fit scale-[0.85] origin-left">{getStatusTag(ticket.status)}</div>
                                        <div className="w-fit scale-[0.85] origin-left">{getPriorityTag(ticket.priority)}</div>
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-3 mb-3 border-t border-gray-100 dark:border-gray-800 pt-3">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400">دسته‌بندی</span>
                                        <span className="text-xs text-gray-700 dark:text-gray-300">
                                            {ticket.category}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <span className="text-[10px] text-gray-400">آخرین بروزرسانی</span>
                                        <span className="text-xs text-gray-700 dark:text-gray-300" dir="ltr">
                                            {formatDate(ticket.updated_at)}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800 mt-2">
                                    <Button
                                        className="w-full"
                                        variant="solid"
                                        size="sm"
                                        onClick={() => navigate(`/owner/support/ticket/${ticket.id}`)}
                                    >
                                        مشاهده
                                    </Button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-8 text-center text-gray-500 dark:text-gray-400 text-sm">
                            <HiOutlineTicket className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                            تیکتی یافت نشد
                        </div>
                    )}
                </div>
            </Card>
        </div>
    )
}

export default Support
