// 中文景点名称到英文搜索关键词的映射
export const attractionMapping: Record<string, string[]> = {
  // 北京
  '故宫': ['Forbidden City Beijing', 'Palace Museum Beijing', 'Imperial Palace China'],
  '故宫博物院': ['Forbidden City Beijing', 'Palace Museum Beijing', 'Imperial Palace China'],
  '天安门广场': ['Tiananmen Square Beijing', 'Tiananmen Square China'],
  '天坛': ['Temple of Heaven Beijing', 'Tiantan Park Beijing'],
  '颐和园': ['Summer Palace Beijing', 'Yiheyuan Beijing'],
  '长城': ['Great Wall of China', 'Badaling Great Wall', 'Mutianyu Great Wall'],
  '八达岭长城': ['Badaling Great Wall Beijing', 'Great Wall of China'],
  '慕田峪长城': ['Mutianyu Great Wall Beijing', 'Great Wall of China'],
  '北海公园': ['Beihai Park Beijing', 'Beijing park lake'],
  '什刹海': ['Shichahai Beijing', 'Beijing hutong lake'],
  '后海': ['Houhai Beijing', 'Beijing bar street lake'],
  '三里屯': ['Sanlitun Beijing', 'Beijing nightlife shopping'],
  '王府井': ['Wangfujing Beijing', 'Beijing shopping street'],
  '王府井步行街': ['Wangfujing Beijing', 'Beijing shopping street', 'Beijing pedestrian street'],
  '雍和宫': ['Lama Temple Beijing', 'Yonghe Temple Beijing'],
  '798艺术区': ['798 Art District Beijing', 'Beijing contemporary art', 'Beijing art zone'],
  '鸟巢': ['Beijing National Stadium', 'Birds Nest Beijing Olympics'],
  '水立方': ['Beijing Aquatics Center', 'Water Cube Beijing Olympics'],
  '明十三陵': ['Ming Tombs Beijing', 'Ming Dynasty tombs China'],
  '圆明园': ['Old Summer Palace Beijing', 'Yuanmingyuan Beijing'],
  '香山公园': ['Fragrant Hills Beijing', 'Xiangshan Park Beijing autumn'],
  '簋街': ['Ghost Street Beijing', 'Beijing food street', 'Beijing night market'],
  '南锣鼓巷': ['Nanluoguxiang Beijing', 'Beijing hutong alley', 'Beijing traditional street'],
  '前门大街': ['Qianmen Street Beijing', 'Beijing traditional shopping street'],
  '天坛公园': ['Temple of Heaven Beijing', 'Tiantan Park Beijing', 'Beijing imperial temple'],
  
  // 上海
  '外滩': ['The Bund Shanghai', 'Shanghai waterfront skyline'],
  '东方明珠塔': ['Oriental Pearl Tower Shanghai', 'Shanghai TV tower'],
  '豫园': ['Yuyuan Garden Shanghai', 'Shanghai classical garden'],
  '南京路': ['Nanjing Road Shanghai', 'Shanghai shopping street'],
  '田子坊': ['Tianzifang Shanghai', 'Shanghai art district'],
  '新天地': ['Xintiandi Shanghai', 'Shanghai entertainment district'],
  '上海博物馆': ['Shanghai Museum', 'Shanghai cultural museum'],
  '上海科技馆': ['Shanghai Science Technology Museum'],
  '中华艺术宫': ['China Art Museum Shanghai', 'Shanghai art gallery'],
  '朱家角': ['Zhujiajiao water town Shanghai', 'Shanghai ancient town'],
  
  // 餐厅和美食
  '全聚德': ['Quanjude Peking Duck', 'Beijing roast duck restaurant', 'Chinese cuisine'],
  '全聚德烤鸭店': ['Quanjude Peking Duck', 'Beijing roast duck restaurant', 'Chinese cuisine'],
  '中国国家博物馆': ['National Museum of China Beijing', 'China National Museum', 'Beijing museum'],
  
  // 广州
  '广州塔': ['Canton Tower Guangzhou', 'Guangzhou TV tower'],
  '陈家祠': ['Chen Clan Ancestral Hall Guangzhou', 'Guangzhou traditional architecture'],
  '沙面岛': ['Shamian Island Guangzhou', 'Guangzhou colonial architecture'],
  '白云山': ['Baiyun Mountain Guangzhou', 'Guangzhou mountain park'],
  '越秀公园': ['Yuexiu Park Guangzhou', 'Guangzhou city park'],
  
  // 深圳
  '世界之窗': ['Window of the World Shenzhen', 'Shenzhen theme park'],
  '东门老街': ['Dongmen Pedestrian Street Shenzhen', 'Shenzhen shopping'],
  '大梅沙海滨公园': ['Dameisha Beach Shenzhen', 'Shenzhen beach'],
  '莲花山公园': ['Lianhuashan Park Shenzhen', 'Shenzhen city park'],
  
  // 西安
  '兵马俑': ['Terracotta Warriors Xian', 'Terracotta Army China'],
  '大雁塔': ['Giant Wild Goose Pagoda Xian', 'Dayan Pagoda Xian'],
  '西安城墙': ['Xian City Wall', 'Ancient city wall China'],
  '华清宫': ['Huaqing Palace Xian', 'Xian hot springs palace'],
  '回民街': ['Muslim Quarter Xian', 'Xian food street'],
  
  // 成都
  '大熊猫繁育研究基地': ['Chengdu Panda Base', 'Giant panda Chengdu'],
  '宽窄巷子': ['Kuanzhai Alley Chengdu', 'Chengdu traditional street'],
  '锦里': ['Jinli Ancient Street Chengdu', 'Chengdu traditional architecture'],
  '武侯祠': ['Wuhou Shrine Chengdu', 'Chengdu Three Kingdoms'],
  '杜甫草堂': ['Du Fu Thatched Cottage Chengdu', 'Chengdu poet museum'],
  
  // 杭州
  '西湖': ['West Lake Hangzhou', 'Hangzhou scenic lake'],
  '雷峰塔': ['Leifeng Pagoda Hangzhou', 'West Lake pagoda'],
  '灵隐寺': ['Lingyin Temple Hangzhou', 'Hangzhou Buddhist temple'],
  '千岛湖': ['Thousand Island Lake Hangzhou', 'Qiandao Lake China'],
  
  // 南京
  '中山陵': ['Sun Yat-sen Mausoleum Nanjing', 'Dr Sun Yat-sen Mausoleum'],
  '明孝陵': ['Ming Xiaoling Mausoleum Nanjing', 'Ming Dynasty tomb Nanjing'],
  '夫子庙': ['Confucius Temple Nanjing', 'Nanjing traditional architecture'],
  '总统府': ['Presidential Palace Nanjing', 'Nanjing historical building'],
  
  // 苏州
  '拙政园': ['Humble Administrators Garden Suzhou', 'Suzhou classical garden'],
  '留园': ['Lingering Garden Suzhou', 'Suzhou garden'],
  '虎丘': ['Tiger Hill Suzhou', 'Suzhou pagoda hill'],
  '平江路': ['Pingjiang Road Suzhou', 'Suzhou ancient street'],
  
  // 通用分类关键词
  '博物馆': ['museum architecture', 'cultural museum building'],
  '公园': ['city park landscape', 'urban park scenery'],
  '古街': ['ancient street China', 'traditional Chinese street'],
  '寺庙': ['Chinese temple', 'Buddhist temple architecture'],
  '购物中心': ['shopping mall', 'commercial district'],
  '美食街': ['food street Asia', 'Asian street food market'],
  '酒吧街': ['nightlife district', 'bar street urban'],
  '艺术区': ['art district', 'contemporary art space'],
  '古镇': ['ancient town China', 'traditional Chinese town'],
  '山峰': ['mountain scenery China', 'Chinese landscape mountain'],
  '湖泊': ['lake scenery China', 'beautiful lake landscape'],
  '海滩': ['beach China', 'coastal scenery'],
  '建筑': ['Chinese architecture', 'traditional building'],
  '现代建筑': ['modern architecture', 'contemporary building']
}

// 根据景点名称获取最佳搜索关键词
export function getBestSearchTerms(attractionName: string): string[] {
  // 直接匹配
  if (attractionMapping[attractionName]) {
    return attractionMapping[attractionName]
  }
  
  // 部分匹配
  for (const [key, terms] of Object.entries(attractionMapping)) {
    if (attractionName.includes(key) || key.includes(attractionName)) {
      return terms
    }
  }
  
  // 分类匹配
  if (attractionName.includes('博物馆')) return attractionMapping['博物馆']
  if (attractionName.includes('公园')) return attractionMapping['公园']
  if (attractionName.includes('寺') || attractionName.includes('庙')) return attractionMapping['寺庙']
  if (attractionName.includes('街') || attractionName.includes('路')) return attractionMapping['古街']
  if (attractionName.includes('购物')) return attractionMapping['购物中心']
  if (attractionName.includes('美食')) return attractionMapping['美食街']
  if (attractionName.includes('酒吧')) return attractionMapping['酒吧街']
  if (attractionName.includes('艺术')) return attractionMapping['艺术区']
  if (attractionName.includes('古镇')) return attractionMapping['古镇']
  if (attractionName.includes('山')) return attractionMapping['山峰']
  if (attractionName.includes('湖')) return attractionMapping['湖泊']
  if (attractionName.includes('海')) return attractionMapping['海滩']
  if (attractionName.includes('现代')) return attractionMapping['现代建筑']
  
  // 默认返回景点名称本身和通用建筑关键词
  return [attractionName, 'Chinese architecture', 'China landmark']
}