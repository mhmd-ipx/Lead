import { useState } from 'react'
import { Card, Button, Input, Tag, Badge } from '@/components/ui'
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

const { Tr, Th, Td, THead, TBody } = Table

interface Ticket {
    id: string
    subject: string
    category: 'فنی' | 'مالی' | 'عمومی'
    priority: 'low' | 'medium' | 'high'
    status: 'open' | 'pending' | 'closed'
    createdAt: string
    updatedAt: string
}

type FilterType = 'all' | 'open' | 'pending' | 'closed'

const Support = () => {
    const navigate = useNavigate()
    const [selectedFilter, setSelectedFilter] = useState<FilterType>('all')
    const [searchQuery, setSearchQuery] = useState('')

    const [tickets] = useState<Ticket[]>([
        {
            id: 'TKT-001',
            subject: 'مشکل در ورود به سیستم',
            category: 'فنی',
            priority: 'high',
            status: 'open',
            createdAt: '1403/09/22 - 14:30',
            updatedAt: '1403/09/22 - 15:00',
        },
        {
            id: 'TKT-002',
            subject: 'سوال درباره پرداخت',
            category: 'مالی',
            priority: 'medium',
            status: 'pending',
            createdAt: '1403/09/21 - 10:20',
            updatedAt: '1403/09/21 - 11:15',
        },
        {
            id: 'TKT-003',
            subject: 'درخواست ویژگی جدید',
            category: 'عمومی',
            priority: 'low',
            status: 'closed',
            createdAt: '1403/09/20 - 09:00',
            updatedAt: '1403/09/20 - 16:00',
        },
    ])

    const getPriorityTag = (priority: Ticket['priority']) => {
        switch (priority) {
            case 'high':
                return <Tag className="bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-100 border-0">فوری</Tag>
            case 'medium':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">متوسط</Tag>
            case 'low':
                return <Tag className="bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-100 border-0">کم</Tag>
        }
    }

    const getStatusTag = (status: Ticket['status']) => {
        switch (status) {
            case 'open':
                return <Tag className="bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-100 border-0">باز</Tag>
            case 'pending':
                return <Tag className="bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 border-0">در انتظار</Tag>
            case 'closed':
                return <Tag className="bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border-0">بسته شده</Tag>
        }
    }

    const filteredTickets = tickets.filter(ticket => {
        const matchesFilter = selectedFilter === 'all' || ticket.status === selectedFilter
        const matchesSearch = ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ticket.id.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesFilter && matchesSearch
    })

    const openCount = tickets.filter(t => t.status === 'open').length
    const pendingCount = tickets.filter(t => t.status === 'pending').length
    const closedCount = tickets.filter(t => t.status === 'closed').length

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
                    onClick={() => navigate('/owner/support/create')}
                >
                    ایجاد تیکت جدید
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'all' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('all')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">همه تیکت‌ها</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{tickets.length}</h3>
                        </div>
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineTicket className="text-2xl text-purple-600 dark:text-purple-400" />
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
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{openCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <Badge innerClass="bg-green-500" />
                        </div>
                    </div>
                </Card>

                <Card
                    className={classNames(
                        'p-4 cursor-pointer transition-all',
                        selectedFilter === 'pending' && 'ring-2 ring-primary'
                    )}
                    onClick={() => setSelectedFilter('pending')}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">در انتظار</p>
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{pendingCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineClock className="text-2xl text-amber-600 dark:text-amber-400" />
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
                            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{closedCount}</h3>
                        </div>
                        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-900/30 rounded-full flex items-center justify-center">
                            <HiOutlineCheckCircle className="text-2xl text-gray-600 dark:text-gray-400" />
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
                        {selectedFilter !== 'all' && (
                            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 mr-2">
                                ({filteredTickets.length} مورد)
                            </span>
                        )}
                    </h2>
                    <div className="overflow-x-auto">
                        <Table>
                            <THead>
                                <Tr>
                                    <Th>شناسه</Th>
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
                                {filteredTickets.map((ticket) => (
                                    <Tr key={ticket.id}>
                                        <Td>
                                            <span className="font-mono font-semibold text-primary">
                                                {ticket.id}
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
                                        <Td>{ticket.createdAt}</Td>
                                        <Td>{ticket.updatedAt}</Td>
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
                                ))}
                                {filteredTickets.length === 0 && (
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
