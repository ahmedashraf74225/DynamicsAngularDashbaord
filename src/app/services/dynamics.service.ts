import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class DynamicsService {
  constructor(private http: HttpClient) {}

  private getBaseUrl(): string {
    const context = (window as any).parent.Xrm?.Utility?.getGlobalContext();
    return context ? `${context.getClientUrl()}/api/data/v9.1/` : '';
  }

  async getQueueData() {
    const fetchXml = `
      <fetch>
        <entity name="arb_queueaht">
          <attribute name="arb_queueahtid" />
          <attribute name="arb_slastatus" />
          
          <link-entity name="queue" from="queueid" to="arb_queue" alias="q">
            <attribute name="name" />
          </link-entity>

          <link-entity name="arb_casequeuehistory" from="arb_queueaht" to="arb_queueahtid" alias="h" link-type="outer">
            <attribute name="arb_logintime" />
            <attribute name="arb_logouttime" />
          </link-entity>

          <filter>
            <condition attribute="statecode" operator="eq" value="0" />
          </filter>
        </entity>
      </fetch>`;

    const url = `${this.getBaseUrl()}arb_queueahts?fetchXml=${encodeURIComponent(fetchXml)}`;
    const res: any = await this.http.get(url).toPromise();
    return this.transformData(res.value);
  }

 private transformData(rows: any[]) {
  const ahtMap = new Map(); 
  const queueMap = new Map(); 
  const now = new Date();

  // PASS 1: Identify absolute start/end per unique assignment
  rows.forEach(item => {
    const ahtId = item.arb_queueahtid;
    const queueName = item['q.name'] || 'Unknown';
    const loginTime = item['h.arb_logintime'] ? new Date(item['h.arb_logintime']) : null;
    const logoutTime = item['h.arb_logouttime'] ? new Date(item['h.arb_logouttime']) : now;
    const slaStatus = item.arb_slastatus;

    if (!ahtMap.has(ahtId)) {
      ahtMap.set(ahtId, {
        queueName: queueName,
        status: slaStatus,
        minLogin: loginTime,
        maxLogout: logoutTime
      });
    } else {
      const aht = ahtMap.get(ahtId);
      if (loginTime && (!aht.minLogin || loginTime < aht.minLogin)) aht.minLogin = loginTime;
      if (logoutTime > aht.maxLogout) aht.maxLogout = logoutTime;
    }
  });

  // PASS 2: Aggregate results by Queue Name
  ahtMap.forEach((aht) => {
    if (!queueMap.has(aht.queueName)) {
      queueMap.set(aht.queueName, { 
        name: aht.queueName, 
        open: 0, 
        withinSLA: 0, 
        slaRelevantTotal: 0, 
        agesInDays: [] // FIX: Ensure this array is initialized here
      });
    }

    const entry = queueMap.get(aht.queueName);
    entry.open += 1;

    // SLA Logic
    if (aht.status === 1 || aht.status === 2) {
      entry.withinSLA += 1;
      entry.slaRelevantTotal += 1;
    } else if (aht.status === 3) {
      entry.slaRelevantTotal += 1;
    }

    // Calculate span and push to array
    if (aht.minLogin) {
      const spanInDays = (aht.maxLogout.getTime() - aht.minLogin.getTime()) / (1000 * 3600 * 24);
      entry.agesInDays.push(spanInDays); // Now 'push' will work correctly
    }
  });

  return Array.from(queueMap.values()).map(q => {
    return {
      name: q.name,
      open: q.open,
      avgCaseAge: q.agesInDays.length > 0 ? 
        (q.agesInDays.reduce((a: any, b: any) => a + b, 0) / q.agesInDays.length).toFixed(1) + ' days' : '0.0 days',
      oldestCaseAge: q.agesInDays.length > 0 ? 
        Math.max(...q.agesInDays).toFixed(2) + ' days' : '0.0 days',
      compliance: q.slaRelevantTotal > 0 ? Math.round((q.withinSLA / q.slaRelevantTotal) * 100) : 0
    };
  });
}

  async getKpiData() {
        const fetchXml = `
          <fetch aggregate="true">
            <entity name="arb_queueaht">
              <attribute name="arb_queueahtid" alias="Count" aggregate="count" />
              <attribute name="arb_slastatus" alias="Status" groupby="true" />
              <filter type="and">
                <condition attribute="statecode" operator="eq" value="0" />
                <condition attribute="arb_slastatus" operator="in">
                  <value>1</value>
                  <value>2</value>
                  <value>3</value>
                </condition>
              </filter>
            </entity>
          </fetch>`;

        const url = `${this.getBaseUrl()}arb_queueahts?fetchXml=${encodeURIComponent(fetchXml)}`;
        const res: any = await this.http.get(url).toPromise();
        
        // Initialize with zeros
        const stats = { total: 0, within: 0, atRisk: 0, breached: 0 };

        res.value.forEach((item: any) => {
          const count = parseInt(item.Count);
          const status = item.Status;

          // Total Open Cases (Sum of 1, 2, and 3)
          stats.total += count;

          if (status === 1) stats.within += count;   // Within SLA
          if (status === 2) stats.atRisk += count;   // Expire Soon / At Risk
          if (status === 3) stats.breached += count; // Breached SLA
        });

        return stats;
}

  async getCriticalCases() {
    const fetchXml = `
      <fetch>
        <entity name="arb_queueaht">
          <attribute name="arb_slastatus" />
          <link-entity name="incident" from="incidentid" to="arb_case" alias="inc">
            <attribute name="arb_casenumber" />
            <link-entity name="systemuser" from="systemuserid" to="ownerid" alias="u">
              <attribute name="fullname" />
            </link-entity>
          </link-entity>
          <link-entity name="queue" from="queueid" to="arb_queue" alias="q">
            <attribute name="name" />
          </link-entity>
          <link-entity name="arb_casequeuehistory" from="arb_queueaht" to="arb_queueahtid" alias="h" link-type="outer">
            <attribute name="arb_logintime" />
            <attribute name="arb_logouttime" />
          </link-entity>
          <filter>
            <condition attribute="statecode" operator="eq" value="0" />
            <condition attribute="arb_slastatus" operator="in">
              <value>2</value>
              <value>3</value>
            </condition>
          </filter>
        </entity>
      </fetch>`;

    const url = `${this.getBaseUrl()}arb_queueahts?fetchXml=${encodeURIComponent(fetchXml)}`;
    const res: any = await this.http.get(url).toPromise();
    
    return res.value.map((item: any) => ({
      caseNumber: item['inc.arb_casenumber'], 
      queueName: item['q.name'],
      enteredAt: item['h.arb_logintime'] ? new Date(item['h.arb_logintime']).toLocaleString() : 'N/A',
      exitedAt: item['h.arb_logouttime'] ? new Date(item['h.arb_logouttime']).toLocaleString() : 'Active',
      owner: item['u.fullname'],
      status: item.arb_slastatus
    }));
  }

  private calculateSlaCountdown(targetDate: string): string {
    if (!targetDate) return "0:00";
    const diff = new Date(targetDate).getTime() - new Date().getTime();
    const absMins = Math.abs(Math.floor(diff / 60000));
    const hours = Math.floor(absMins / 60);
    const mins = absMins % 60;
    return `${diff < 0 ? '-' : ''}${hours}:${mins < 10 ? '0' : ''}${mins}`;
  }
}