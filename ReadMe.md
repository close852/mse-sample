Adaptive HTTP Streaming

기존 스트리밍 방식 : Progressive Download => 동영상 소스가 선택되면, 해당 콘텐츠를 끝까지 다운로드 하면서, 플레이 하는 방식.
*HTML5 VIDEO도 기본적으로 PD 방식을 사용할 수 있다.
단점 : 
    한가지 해상도 동영상 소스가 선택되어 다운로드 하니, 사용자 네트워크 상황에 따라 버퍼 발생.

위의 문제를 해결하기 위해 Adaptive Streaming 방식 만듦.

Adaptive Streaming [IDEA]
1. 다양한 해상도로 인코딩하여 저장(360p,480p,720p,1080p)
2. 데이터 단위를 동영상 컨테츠 하나가 아닌, 잘게 쪼개 저장하는 방식

서버 작업
1. 동영상 파일을 각 해상도별 인코딩
2. 세그먼트들은 서비스에 필요에 따라 구분한 대응된 해상도 별로 인코딩.
3. 조각난 파일들에 대한 정보(Manifest)를 클라이언트에 제공
** 동영상 파일을 작은 세그먼트로 잘라 낼때는 코덱별로 필요한 도구를 사용하게 되고 동영상의 조각난 세그먼트에 대한 정보를 제공해주는 문서 포맷에는 Apple-HLS와 MPEG-DASH이 있다.

클라이언트 작업
표준기술 : MSE : Media Source Extensions
1. 플레이할 동영상의 각 해상도별 세그먼트 정보가 있는 Manifest 파일을 서버에 요청
2.  Manifest 파일 파싱
        1. 비디오에 대한 정보
        2. 사용가능한 해상도 선택
        3. 세그먼트 URL 정보
3. 사용자의 네트워크 대역폭을 측정하여 Manifest에 따라 해상도 선택 후, 세그먼트 다운로드
4. 다운로드한 세그먼트의 데이터를 MSE 버퍼에 제공
5. MSE는 데이터를 디코딩하여 비디오 객체에 제공하여 플레이.(3-5 반복)

Menifest에 대한 스펙:프로토콜
    * Apple-HLS
    * Mpeg-DASH

Apple-HLS
    1. Apple에서 개발(Edge, 안드로이드 브라우저에서 지원)
    2. 사파리, Edge, 안드로이드 기종의 브라우저에서는 HSL 스트리밍 가능
    3. 모바일 사파리에서는 MSE를 지원하지 않아 HLS만 가능
    4. 미디어 컨테이너 포맷:MP2TS,mp4
    5. Manifest로 mp3 음원 모곩 만들 때 사용하던 M3U8 플레이리스트 이용.
##
    #EXTM3U
    #EXT-X-STREAM-INF:PROGRAM-ID=1, BANDWIDTH=200000, RESOLUTION=720x480
    http://ALPHA.mycompany.com/lo/prog_index.m3u8
    #EXT-X-STREAM-INF:PROGRAM-ID=1, BANDWIDTH=200000, RESOLUTION=720x480
    http://BETA.mycompany.com/lo/prog_index.m3u8

    #EXT-X-STREAM-INF:PROGRAM-ID=1, BANDWIDTH=500000, RESOLUTION=1920x1080
    http://ALPHA.mycompany.com/md/prog_index.m3u8
    #EXT-X-STREAM-INF:PROGRAM-ID=1, BANDWIDTH=500000, RESOLUTION=1920x1080
    http://BETA.mycompany.com/md/prog_index.m3u8
    ....중략....
##


Mpeg-DASH
    1. MPEG, ISO에 비준된 표준 포맷 - 표준임
    2. DASH는 MSE를 이용해 브라우저 네이티브 재생기능 이용가능
        ㄴMSE를 통해 서비스가 원하는대로 Adaptive 스트리밍 직접 구현 필요
    3. 미디어 컨테이너 포맷에 제한이 없음.
    4. 광고 삽입이 수월하고 자연스럽다(Period)
    5. Menifest가 XML로 구성되어, 풍성한 표현이 가능, 다양한 정보를 한 개의 MPD로 제공.(DRM 정보도 포함) -MPD : Media Presentation Description

##
    <?xml version="1.0"?>
    <MPD xmlns="urn:mpeg:dash:schema:mpd:2011" profiles="urn:mpeg:dash:profile:full:2011" minBufferTime="PT1.5S">
        <!-- Ad -->
        <Period duration="PT30S">
            <BaseURL>ad/</BaseURL>
            <!-- Everything in one Adaptation Set -->
            <AdaptationSet mimeType="video/mp2t">
                <!-- 720p Representation at 3.2 Mbps -->
                <Representation id="720p" bandwidth="3200000" width="1280" height="720">
                    <!-- Just use one segment, since the ad is only 30 seconds long -->
                    <BaseURL>720p.ts</BaseURL>
                    <SegmentBase>
                        <RepresentationIndex sourceURL="720p.sidx"/>
                    </SegmentBase>
                </Representation>
                <!-- 1080p Representation at 6.8 Mbps -->
                <Representation id="1080p" bandwidth="6800000" width="1920" height="1080">
                    <BaseURL>1080p.ts</BaseURL>
                    <SegmentBase>
                        <RepresentationIndex sourceURL="1080p.sidx"/>
                    </SegmentBase>
                </Representation>
    ....중략....
##

* HLS는 맥용 사파리, 모바일용 사파리에서 미디어 소스 바로 적용가능
* DASH는 MSE를 이용해 직접 미디어 소스를 확장해야 한다.

사실 DASH, HLS는 스트리밍할 미디어 데이터의 정보를 플레이어에 전달 목적으로 만들어져서 실질적으로 플레이에 관여하지 않음.
MSE는 DASH 또는 HSL Manifest를 통해 필요한 미디어 정보를 얻어 실질적 미디어 세그먼트들을 HTML5 비디오를 통해 플레이할 때 사용한다.
(사파리에서는 HLS Manifest를 소스로 사용 가능)

********************************************************
 MSE는 HTML5의 비디오로 동영상을 재생할 때 소스를 제공할 목적으로 사용하던 source 태그 대신 HTMLMediaElement을 이용해 개발자가 직접 새로운 미디어 소스를 정의할 수 있게 해주는 인터페이스이다.
 ********************************************************

 세그먼트
    인코딩된 동영상의 작은 조각( 조각의 정보는 DASH, HLS를 통해 얻음. )
    종류 : Initialization Segment, Media Segment
    초기화 세그먼트 : 
        - 미디어 세그먼트 시퀀스 디코딩에 필요한 정보를 포함.(코덱 초기화 데이터, 트랙ID, 타임 스탬프 오프셋)
    미디어 세그먼트 : 
        - 패킷화된(플레이되어야 할) 미디어 타임라인상의 타임스탬프 정보가 포함된 실제 동영상 데이터.
        - 세그먼트들을 순차적으로 제공하지 않아도 됨(해당정보는 초기화 세그먼트에게 있음) BUT, 초기화 세그먼트가 없다면 정상적으로 플레이 되지 않음.

    