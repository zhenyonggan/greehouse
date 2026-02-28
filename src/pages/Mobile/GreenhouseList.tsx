
import React, { useEffect, useState } from 'react';
import { Card, List, SearchBar, PullToRefresh, InfiniteScroll, Tag, NavBar } from 'antd-mobile';
import { AddOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { greenhouseService } from '../../services/greenhouseService';
import { Greenhouse } from '../../types';

const MobileGreenhouses: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<Greenhouse[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');

  const loadMore = async (isRefresh = false) => {
    const page = isRefresh ? 1 : Math.ceil(data.length / 10) + 1;
    const { data: newData, count } = await greenhouseService.getGreenhouses({ 
        page, 
        limit: 10,
        search 
    });
    
    if (isRefresh) {
        setData(newData as Greenhouse[]);
    } else {
        setData(val => [...val, ...(newData as Greenhouse[])]);
    }
    setHasMore(data.length + (newData?.length || 0) < (count || 0));
  };

  useEffect(() => {
    loadMore(true);
  }, [search]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <NavBar back={null} right={<AddOutline fontSize={24} onClick={() => {}} />}>大棚管理</NavBar>
      <div className="p-3 bg-white sticky top-0 z-10">
        <SearchBar placeholder="搜索大棚名称/编号" onChange={val => setSearch(val)} />
      </div>
      
      <div className="p-3 space-y-3">
        {data.map(item => (
            <Card key={item.id} onClick={() => navigate(`/m/greenhouses/${item.id}`)}>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                    <Tag color={item.status === 'active' ? 'success' : 'warning'}>
                        {item.status === 'active' ? '正常' : '闲置'}
                    </Tag>
                </div>
                <div className="text-sm text-gray-500 grid grid-cols-2 gap-2">
                    <div>编号: {item.code}</div>
                    <div>面积: {item.area}㎡</div>
                    <div>类型: {item.structure_type === 'glass' ? '玻璃温室' : '塑料大棚'}</div>
                    <div>负责人: {item.manager?.full_name || '未分配'}</div>
                </div>
            </Card>
        ))}
        <InfiniteScroll loadMore={() => loadMore()} hasMore={hasMore} />
      </div>
    </div>
  );
};

export default MobileGreenhouses;
